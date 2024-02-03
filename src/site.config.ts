import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Kirill So",
	// Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
	title: "Kirill's Personal Website & Blog",
	// Meta property used as the default description meta property
	description:
		"Kirill So is a growth product manager, occasional writer and part-time indie maker. This website is used as exploration of ideas, tiny projects and learning new things via experiments. Occasionally, I send out a newsletter about making sense of the world.",
	// HTML lang property, found in src/layouts/Base.astro L:18
	lang: "en-GB",
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: "en_GB",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-GB",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
};

// Used to generate links in both the Header & Footer.
export const menuLinks: Array<{ title: string; path: string }> = [
	{
		title: "Home",
		path: "/",
	},
	{
		title: "About",
		path: "/about/",
	},
	{
		title: "Blog",
		path: "/posts/",
	},
	{
		title: "Projects",
		path: "/projects/",
	},
	{
		title: "Tags",
		path: "/tags/",
	},
];
