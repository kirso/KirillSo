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
	border: "#e7e5e4", // warm border (stone-200)
};

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
	html`<div tw="flex flex-col w-full h-full bg-[${colors.bg}] text-[${colors.text}]">
		<div tw="flex flex-col flex-1 w-full p-16 justify-center">
			<p tw="text-2xl mb-4 text-[${colors.secondary}]">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-tight tracking-tight">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full px-16 py-8 border-t border-[${colors.border}]">
			<div tw="flex items-center">
				<img src="${headshotBase64}" tw="w-12 h-12 rounded-full" style="object-fit: cover;" />
				<p tw="text-xl font-bold ml-4">${siteConfig.author}</p>
			</div>
			<p tw="text-xl text-[${colors.secondary}]">kirillso.com</p>
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
