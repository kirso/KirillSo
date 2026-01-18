import fs from "node:fs";
// Rehype plugins
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";
// Remark plugins
import remarkDirective from "remark-directive"; /* Handle ::: directives as nodes */
import { remarkAdmonitions } from "./src/plugins/remark-admonitions"; /* Add admonitions */
import { remarkGithubCard } from "./src/plugins/remark-github-card";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import { expressiveCodeOptions, siteConfig } from "./src/site.config";

// https://astro.build/config
export default defineConfig({
	site: siteConfig.url,
	image: {
		domains: ["webmention.io"],
	},
	integrations: [
		svelte(),
		expressiveCode(expressiveCodeOptions),
		icon(),
		sitemap({
			filter: (page) => {
				// Exclude /notes/page/1 and /posts/page/1 from sitemap
				return !page.includes("/notes/page/1") && !page.includes("/posts/page/1");
			},
		}),
		mdx(),
		robotsTxt(),
		webmanifest({
			// See: https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md
			name: siteConfig.title,
			short_name: "kirill_so", // optional
			description: siteConfig.description,
			lang: siteConfig.lang,
			icon: "public/icon.svg", // the source for generating favicon & icons
			icons: [
				{
					src: "icons/apple-touch-icon.png", // used in src/components/BaseHead.astro L:26
					sizes: "180x180",
					type: "image/png",
				},
				{
					src: "icons/icon-192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "icons/icon-512.png",
					sizes: "512x512",
					type: "image/png",
				},
			],
			start_url: "/",
			background_color: "#1d1f21",
			theme_color: "#2bbc8a",
			display: "standalone",
			config: {
				insertFaviconLinks: false,
				insertThemeColorMeta: false,
				insertManifestLink: false,
			},
		}),
	],
	markdown: {
		rehypePlugins: [
			rehypeHeadingIds,
			[rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["not-prose"] } }],
			[
				rehypeExternalLinks,
				{
					rel: ["noreferrer", "noopener"],
					target: "_blank",
				},
			],
			rehypeUnwrapImages,
		],
		remarkPlugins: [remarkReadingTime, remarkDirective, remarkGithubCard, remarkAdmonitions],
		remarkRehype: {
			footnoteLabelProperties: {
				className: [""],
			},
		},
	},
	// https://docs.astro.build/en/guides/prefetch/
	prefetch: true,
	vite: {
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		ssr: {
			// Externalize native Node.js modules that are only used in prerendered routes
			external: ["@resvg/resvg-js"],
		},
		plugins: [tailwind(), rawFonts([".ttf", ".woff"]), rawImages([".png"])],
	},
	env: {
		schema: {
			WEBMENTION_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
			WEBMENTION_URL: envField.string({ context: "client", access: "public", optional: true }),
			WEBMENTION_PINGBACK: envField.string({ context: "client", access: "public", optional: true }),
			GOOGLE_AI_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
		},
	},
	output: "server",
	adapter: cloudflare({
		platformProxy: {
			enabled: true, // Enables local Cloudflare runtime emulation
		},
		imageService: "compile", // Uses sharp at build time for images
		routes: {
			extend: {
				exclude: [
					{ pattern: "/pagefind/*" }, // Serve pagefind search statically
					{ pattern: "/robots.txt" }, // Serve robots.txt statically
					{ pattern: "/sitemap-index.xml" }, // Serve sitemap statically
					{ pattern: "/sitemap-0.xml" }, // Serve sitemap statically
				],
			},
		},
	}),
});

function rawFonts(ext: string[]) {
	return {
		name: "vite-plugin-raw-fonts",
		// @ts-expect-error:next-line
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}

function rawImages(ext: string[]) {
	return {
		name: "vite-plugin-raw-images",
		// @ts-expect-error:next-line
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e)) && id.includes("og-headshot")) {
				const buffer = fs.readFileSync(id);
				const base64 = buffer.toString("base64");
				const mimeType = id.endsWith(".png") ? "image/png" : "image/jpeg";
				return {
					code: `export default "data:${mimeType};base64,${base64}"`,
					map: null,
				};
			}
		},
	};
}
