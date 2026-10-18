import fs from "node:fs";
import cloudflare from "@astrojs/cloudflare";
import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import {
	hastAutolinkHeadings,
	hastExternalLinks,
	hastUnwrapImages,
	mdastReadingTime,
} from "./src/plugins/satteri";
import { expressiveCodeOptions, siteConfig } from "./src/site.config";

// https://astro.build/config
export default defineConfig({
	site: siteConfig.url,
	image: {
		// img.youtube.com: video thumbnails in posts get sized and lazy-loaded at build time
		domains: ["webmention.io", "img.youtube.com"],
		// Responsive srcset for every image, including Markdown ones
		layout: "constrained",
		responsiveStyles: true,
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: "Geist",
			cssVariable: "--font-geist",
			fallbacks: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
			options: {
				variants: [
					{ src: ["./src/assets/fonts/Geist-Regular.woff2"], weight: 400, style: "normal" },
					{ src: ["./src/assets/fonts/Geist-Medium.woff2"], weight: 500, style: "normal" },
					{ src: ["./src/assets/fonts/Geist-SemiBold.woff2"], weight: 600, style: "normal" },
					{ src: ["./src/assets/fonts/Geist-Bold.woff2"], weight: 700, style: "normal" },
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: "Geist Mono",
			cssVariable: "--font-geist-mono",
			fallbacks: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"],
			options: {
				variants: [
					{ src: ["./src/assets/fonts/GeistMono-Regular.woff2"], weight: 400, style: "normal" },
					{ src: ["./src/assets/fonts/GeistMono-Medium.woff2"], weight: 500, style: "normal" },
				],
			},
		},
	],
	integrations: [
		svelte(),
		expressiveCode(expressiveCodeOptions),
		icon({
			// Only bundle the icons /uses renders; the full set adds ~7MB to the worker
			include: {
				"simple-icons": [
					"anthropic",
					"apple",
					"applemusic",
					"astro",
					"beats",
					"figma",
					"github",
					"googlecalendar",
					"logitech",
					"obsidian",
					"openai",
					"substack",
					"svelte",
					"tailwindcss",
					"vercel",
					"warp",
				],
			},
		}),
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
		processor: satteri({
			mdastPlugins: [mdastReadingTime],
			// Heading ids first so the autolink plugin can read them
			hastPlugins: [
				satteriHeadingIdsPlugin(),
				hastAutolinkHeadings,
				hastExternalLinks,
				hastUnwrapImages,
			],
		}),
	},
	// No sessions are used; avoids provisioning a SESSION KV namespace
	session: false,
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
	// Static by default; on-demand routes opt out with `export const prerender = false`
	adapter: cloudflare({
		imageService: "compile", // Uses sharp at build time for images
		// OG image routes use @resvg/resvg-js (native addon) and node:fs, which need Node to prerender
		prerenderEnvironment: "node",
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
