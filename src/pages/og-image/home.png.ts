export const prerender = true;

import { Resvg } from "@resvg/resvg-js";
import type { APIContext } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import GeistRegular from "@/assets/fonts/Geist-Regular.ttf";
import GeistBold from "@/assets/fonts/Geist-Bold.ttf";
import headshotBase64 from "@/assets/img/og-headshot.png";
import { siteConfig } from "@/site.config";

// Design system colors (warm stone palette) - matches blog OG images
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

const markup = () =>
	html`<div tw="flex w-full h-full text-[${colors.text}] p-12" style="background-color: ${colors.bg}; background-image: ${dotPattern};">
		<!-- L-bracket frame -->
		<div tw="flex flex-1 items-center p-10" style="position: relative;">
			<!-- Top-left corner -->
			<div tw="absolute flex" style="top: 0; left: 0; width: 40px; height: 40px; border-top: 3px solid ${colors.text}; border-left: 3px solid ${colors.text};"></div>
			<!-- Bottom-right corner -->
			<div tw="absolute flex" style="bottom: 0; right: 0; width: 40px; height: 40px; border-bottom: 3px solid ${colors.text}; border-right: 3px solid ${colors.text};"></div>

			<!-- Avatar -->
			<img src="${headshotBase64}" tw="w-56 h-56 rounded-full" style="object-fit: cover;" />

			<!-- Content -->
			<div tw="flex flex-col ml-14 flex-1">
				<p tw="text-2xl tracking-widest text-[${colors.secondary}] mb-3">WWW.KIRILLSO.COM</p>
				<h1 tw="text-6xl font-bold leading-tight tracking-tight">${siteConfig.title}</h1>
				<p tw="text-2xl mt-5 text-[${colors.secondary}]">Thoughts on work and life.</p>
			</div>
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
