export const prerender = true;

import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import GeistRegular from "@/assets/fonts/Geist-Regular.ttf";
import GeistBold from "@/assets/fonts/Geist-Bold.ttf";
import headshotBase64 from "@/assets/img/og-headshot.png";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";

// Design system colors (warm stone palette)
const colors = {
	bg: "#fafaf8", // warm paper white
	text: "#1c1917", // warm black (stone-900)
	secondary: "#57534e", // warm gray (stone-600)
	border: "#d6d3d1", // warm border (stone-300)
	accent: "#a8a29e", // subtle accent (stone-400)
	dot: "#d6d3d1", // dot grid color (stone-300)
};

// SVG dot pattern as data URL
const dotPattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23d6d3d1'/%3E%3C/svg%3E")`;

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

const markup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full text-[${colors.text}] p-12" style="background-color: ${colors.bg}; background-image: ${dotPattern};">
		<!-- L-bracket frame -->
		<div tw="flex flex-col flex-1 p-10" style="position: relative;">
			<!-- Top-left corner -->
			<div tw="absolute flex" style="top: 0; left: 0; width: 40px; height: 40px; border-top: 3px solid ${colors.text}; border-left: 3px solid ${colors.text};"></div>
			<!-- Bottom-right corner -->
			<div tw="absolute flex" style="bottom: 0; right: 0; width: 40px; height: 40px; border-bottom: 3px solid ${colors.text}; border-right: 3px solid ${colors.text};"></div>

			<!-- Header -->
			<div tw="flex items-center mb-8">
				<img src="${headshotBase64}" tw="w-16 h-16 rounded-full" style="object-fit: cover;" />
				<p tw="text-2xl tracking-widest text-[${colors.secondary}] ml-5">WWW.KIRILLSO.COM</p>
			</div>

			<!-- Content -->
			<div tw="flex flex-col flex-1 justify-center">
				<p tw="text-xl mb-3 text-[${colors.secondary}]">${pubDate}</p>
				<h1 tw="text-5xl font-bold leading-snug tracking-tight">${title}</h1>
			</div>
		</div>
	</div>`;

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
