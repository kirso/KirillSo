import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Kirill So",
	// Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
	title: "Kirill So - Personal website & blog",
	// Meta property used as the default description meta property
	description:
		"I am a growth product manager based in Singapore. This website serves as an exploration to tinker with new ideas, tiny projects and learn new things via experiments. From time to time I send out a newsletter and write bout making sense of the world.",
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
