export const prerender = true;

import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import GeistRegular from "@/assets/fonts/Geist-Regular.ttf";
import GeistBold from "@/assets/fonts/Geist-Bold.ttf";
import { headshotBase64 } from "@/assets/img/og-headshot-base64";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";

// Design system colors — Quiet Archive palette (pure OKLCH neutrals)
const colors = {
	bg: "#f5f5f5", // --color-paper (oklch 0.96)
	text: "#262626", // --color-ink (oklch 0.20)
	secondary: "#636363", // --color-ink-secondary (oklch 0.42)
	tertiary: "#7a7a7a", // --color-ink-tertiary (oklch 0.52)
	rule: "#c9c9c9", // --color-rule (oklch 0.82)
	surface: "#ededed", // --color-surface (oklch 0.93)
};

// SVG dot pattern — 20px grid, subtle dots
const dotPattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23c9c9c9'/%3E%3C/svg%3E")`;

const ogOptions: SatoriOptions = {
	fonts: [
		{
			data: Buffer.from(GeistRegular),
			name: "Geist",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.from(GeistBold),
			name: "Geist",
			style: "normal",
			weight: 700,
		},
	],
	height: 630,
	width: 1200,
};

// Build the avatar image element separately to avoid template literal parsing issues with large base64
const avatarImg = {
	type: "img",
	props: {
		src: headshotBase64,
		tw: "w-16 h-16 rounded-full",
		style: { objectFit: "cover" },
	},
};

const markup = (title: string, pubDate: string) => ({
	type: "div",
	props: {
		tw: `flex flex-col w-full h-full text-[${colors.text}]`,
		style: { backgroundColor: colors.bg, backgroundImage: dotPattern },
		children: {
			type: "div",
			props: {
				tw: "flex flex-col flex-1 m-8 p-12",
				style: { position: "relative" },
				children: [
					// Top-left corner
					{
						type: "div",
						props: {
							tw: "absolute flex",
							style: { top: 0, left: 0, width: 60, height: 60, borderTop: `2px solid ${colors.text}`, borderLeft: `2px solid ${colors.text}` },
						},
					},
					// Bottom-right corner
					{
						type: "div",
						props: {
							tw: "absolute flex",
							style: { bottom: 0, right: 0, width: 60, height: 60, borderBottom: `2px solid ${colors.text}`, borderRight: `2px solid ${colors.text}` },
						},
					},
					// Content area
					{
						type: "div",
						props: {
							tw: "flex flex-col flex-1 justify-between",
							children: [
								// Top: Metadata line
								{
									type: "div",
									props: {
										tw: "flex items-center",
										children: {
											type: "p",
											props: {
												tw: `text-2xl text-[${colors.tertiary}]`,
												children: `№ · ${pubDate}`,
											},
										},
									},
								},
								// Center: Title
								{
									type: "div",
									props: {
										tw: "flex flex-col justify-center py-8",
										children: {
											type: "h1",
											props: {
												tw: "text-6xl font-bold leading-tight tracking-tight",
												children: title,
											},
										},
									},
								},
								// Bottom: Branding
								{
									type: "div",
									props: {
										tw: "flex items-center",
										children: [
											{
												type: "div",
												props: {
													tw: "flex rounded-full",
													style: { border: `2px solid ${colors.rule}` },
													children: avatarImg,
												},
											},
											{
												type: "p",
												props: {
													tw: `text-2xl text-[${colors.secondary}] ml-5 font-bold tracking-wide`,
													children: "KIRILLSO.COM",
												},
											},
										],
									},
								},
							],
						},
					},
					// Hanko stamp
					{
						type: "div",
						props: {
							tw: "absolute flex items-center justify-center",
							style: { top: 32, right: 32, width: 64, height: 64, border: `2px solid ${colors.text}` },
							children: {
								type: "p",
								props: {
									tw: `text-2xl font-bold text-[${colors.text}]`,
									children: "KS",
								},
							},
						},
					},
				],
			},
		},
	},
});

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title } = context.props as Props;

	const postDate = getFormattedDate(pubDate, {
		month: "long",
		weekday: "long",
	});
	const svg = await satori(markup(title, postDate), ogOptions);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.id },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}));
}
