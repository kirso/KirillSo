export const prerender = true;

import { Resvg } from "@resvg/resvg-js";
import type { APIContext } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import GeistRegular from "@/assets/fonts/Geist-Regular.ttf";
import GeistBold from "@/assets/fonts/Geist-Bold.ttf";
import headshotBase64 from "@/assets/img/og-headshot.png";
import { siteConfig } from "@/site.config";

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

const markup = () =>
	html`<div tw="flex w-full h-full text-[${colors.text}]" style="background-color: ${colors.bg}; background-image: ${dotPattern};">
		<!-- L-bracket frame -->
		<div tw="flex flex-1 items-center m-8 p-12" style="position: relative;">
			<!-- Top-left corner -->
			<div tw="absolute flex" style="top: 0; left: 0; width: 60px; height: 60px; border-top: 2px solid ${colors.text}; border-left: 2px solid ${colors.text};"></div>
			<!-- Bottom-right corner -->
			<div tw="absolute flex" style="bottom: 0; right: 0; width: 60px; height: 60px; border-bottom: 2px solid ${colors.text}; border-right: 2px solid ${colors.text};"></div>

			<!-- Avatar with ring -->
			<div tw="flex rounded-full" style="border: 3px solid ${colors.rule};">
				<img src="${headshotBase64}" tw="w-56 h-56 rounded-full" style="object-fit: cover;" />
			</div>

			<!-- Content -->
			<div tw="flex flex-col ml-14 flex-1">
				<p tw="text-2xl text-[${colors.tertiary}] mb-3 font-bold tracking-wide">KIRILLSO.COM</p>
				<h1 tw="text-7xl font-bold leading-none tracking-tight">${siteConfig.title}</h1>
				<p tw="text-3xl mt-5 text-[${colors.secondary}]">Thoughts on work and life.</p>
			</div>

			<!-- Hanko stamp - sharp, geometric, top-right -->
			<div tw="absolute flex items-center justify-center" style="top: 32px; right: 32px; width: 72px; height: 72px; border: 2px solid ${colors.text};">
				<p tw="text-3xl font-bold text-[${colors.text}]">KS</p>
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
