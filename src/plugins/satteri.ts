// Markdown plugins for Sätteri, Astro's default Markdown processor.
// Plugins are plain objects; `satteri` is only imported for types.
import getReadingTime from "reading-time";
import type { HastNode, HastPluginDefinition, MdastPluginDefinition } from "satteri";

type Element = Extract<HastNode, { type: "element" }>;

/** Same output as mdast-util-to-string. `ctx.textContent()` skips fenced code values,
 *  which drops code-heavy posts from e.g. 16 to 9 min read. */
// biome-ignore lint/suspicious/noExplicitAny: walks any mdast node
function mdastToString(node: any): string {
	if (typeof node.value === "string") return node.value;
	if (typeof node.alt === "string") return node.alt;
	return Array.isArray(node.children) ? node.children.map(mdastToString).join("") : "";
}

/** remark-reading-time: `remarkPluginFrontmatter.readingTime` ("N min read"). */
export const mdastReadingTime: MdastPluginDefinition = {
	name: "mdast-reading-time",
	after(root, ctx) {
		const astro = ctx.data.astro as { frontmatter: Record<string, unknown> } | undefined;
		if (astro) astro.frontmatter.readingTime = getReadingTime(mdastToString(root)).text;
	},
};

/** rehype-autolink-headings `{ behavior: "wrap", properties: { className: ["not-prose"] } }`.
 *  Must run after `satteriHeadingIdsPlugin()` so headings already carry an id. */
export const hastAutolinkHeadings: HastPluginDefinition = {
	name: "hast-autolink-headings",
	element: {
		filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
		visit(node) {
			const id = node.properties?.id;
			if (typeof id !== "string" || !id) return;
			return {
				type: "element",
				tagName: node.tagName,
				properties: { ...node.properties },
				children: [
					{
						type: "element",
						tagName: "a",
						properties: { className: ["not-prose"], href: `#${id}` },
						children: [...node.children],
					},
				],
			} as Element;
		},
	},
};

/** rehype-external-links `{ rel: ["noreferrer", "noopener"], target: "_blank" }` (http/https + protocol-relative). */
export const hastExternalLinks: HastPluginDefinition = {
	name: "hast-external-links",
	element: {
		filter: ["a"],
		visit(node, ctx) {
			const href = node.properties?.href;
			if (typeof href !== "string") return;
			const scheme = /^([a-zA-Z][a-zA-Z\d+\-.]*):/.exec(href)?.[1];
			const external = scheme ? scheme === "http" || scheme === "https" : href.startsWith("//");
			if (!external) return;
			ctx.setProperty(node, "rel", ["noreferrer", "noopener"]);
			ctx.setProperty(node, "target", "_blank");
		},
	},
};

const INTERACTIVE = new Set([
	"button",
	"details",
	"embed",
	"iframe",
	"keygen",
	"label",
	"select",
	"textarea",
]);
function isInteractive(el: Element): boolean {
	const p = el.properties ?? {};
	if (INTERACTIVE.has(el.tagName)) return true;
	if (el.tagName === "a") return p.href != null;
	if (el.tagName === "input") return p.type !== "hidden";
	if (el.tagName === "audio" || el.tagName === "video") return p.controls != null;
	return p.tabIndex != null;
}

const UNKNOWN = 1;
const IMAGE = 2;
const OTHER = 3;
function applicable(el: Element, inLink: boolean): 1 | 2 | 3 {
	let result: 1 | 2 | 3 = UNKNOWN;
	for (const child of el.children) {
		if (child.type === "text" && /^[ \t\n\f\r]*$/.test(child.value)) continue;
		if (child.type === "element" && child.tagName === "img") {
			result = IMAGE;
		} else if (!inLink && child.type === "element" && isInteractive(child)) {
			const inner = applicable(child, true);
			if (inner === OTHER) return OTHER;
			if (inner === IMAGE) result = IMAGE;
		} else {
			return OTHER;
		}
	}
	return result;
}

/** rehype-unwrap-images: drop the <p> around paragraphs that hold only images (optionally linked). */
export const hastUnwrapImages: HastPluginDefinition = {
	name: "hast-unwrap-images",
	element: {
		filter: ["p"],
		visit(node, ctx) {
			if (applicable(node, false) === IMAGE) ctx.replaceNode(node, [...node.children]);
		},
	},
};
