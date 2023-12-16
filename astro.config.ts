import { defineConfig } from "astro/config";
import fs from "fs";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import remarkUnwrapImages from "remark-unwrap-images";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore:next-line
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
	site: "https://www.kirillso.com/",
	markdown: {
		remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
		remarkRehype: { footnoteLabelProperties: { className: [""] } },
		shikiConfig: {
			theme: "monokai",
			wrap: true,
		},
	},
	prefetch: true,
	integrations: [
		mdx({}),
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
	],
	vite: {
		plugins: [rawFonts([".ttf"])],
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
	},
	redirects: {
		"/blog/app-retargeting-vs-user-acquisition": {
			status: 301,
			destination: "/posts/app-retargeting-vs-user-acquisition",
		},
		"/blog/annual-review": {
			status: 301,
			destination: "/posts/2021-annual-review",
		},
		"/blog/google-clone-project": {
			status: 301,
			destination: "/projects/google-clone",
		},
		"/tags/project": {
			status: 301,
			destination: "/projects",
		},
		"/tags/next-js": {
			status: 301,
			destination: "/projects/google-clone",
		},
		"/blog": {
			status: 301,
			destination: "/posts",
		},
		"/tags/marketing": {
			status: 301,
			destination: "/tags/adtech",
		},
	},
});

function rawFonts(ext: Array<string>) {
	return {
		name: "vite-plugin-raw-fonts",
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore:next-line
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
