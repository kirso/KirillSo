export const prerender = true;

import { Resvg } from "@resvg/resvg-js";
import type { APIContext } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import GeistRegular from "@/assets/fonts/Geist-Regular.ttf";
import GeistBold from "@/assets/fonts/Geist-Bold.ttf";
import { siteConfig } from "@/site.config";

// Design system colors (warm stone palette) - matches blog OG images
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

const markup = () =>
	html`<div tw="flex flex-col w-full h-full bg-[${colors.bg}] text-[${colors.text}]">
		<div tw="flex flex-col flex-1 w-full p-16 justify-center">
			<p tw="text-2xl mb-4 text-[${colors.secondary}]">Personal Site</p>
			<h1 tw="text-6xl font-bold leading-tight tracking-tight">${siteConfig.title}</h1>
			<p tw="text-2xl mt-6 text-[${colors.secondary}]">Thoughts on work and life.</p>
		</div>
		<div tw="flex items-center justify-end w-full px-16 py-8 border-t border-[${colors.border}]">
			<p tw="text-xl text-[${colors.secondary}]">kirillso.com</p>
		</div>
	</div>`;

export async function GET(_context: APIContext) {
	const svg = await satori(markup(), ogOptions);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}
