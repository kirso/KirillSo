import { WEBMENTION_API_KEY } from "astro:env/server";
import type { WebmentionsChildren, WebmentionsFeed } from "@/types";

const DOMAIN = import.meta.env.SITE;
const validWebmentionTypes = ["like-of", "mention-of", "in-reply-to"];

const hostName = new URL(DOMAIN).hostname;

// In-memory cache for build-time fetching (Cloudflare Workers compatible)
let cachedWebmentions: WebmentionsChildren[] | null = null;

// Calls webmention.io api with timeout and error handling
async function fetchWebmentions(timeFrom: string | null, perPage = 1000) {
	if (!DOMAIN) {
		console.warn("No domain specified. Please set in astro.config.ts");
		return null;
	}

	if (!WEBMENTION_API_KEY) {
		console.warn("No webmention api token specified in .env");
		return null;
	}

	let url = `https://webmention.io/api/mentions.jf2?domain=${hostName}&token=${WEBMENTION_API_KEY}&sort-dir=up&per-page=${perPage}`;

	if (timeFrom) url += `&since${timeFrom}`;

	// Add timeout to prevent build failures when webmention.io is slow/unreachable
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

	try {
		const res = await fetch(url, { signal: controller.signal });
		clearTimeout(timeoutId);

		if (res.ok) {
			const data = (await res.json()) as WebmentionsFeed;
			return data;
		}

		console.warn(`Webmention API returned ${res.status}: ${res.statusText}`);
		return null;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				console.warn("Webmention fetch timed out after 5s, using cache");
			} else {
				console.warn(`Webmention fetch failed: ${error.message}`);
			}
		}
		return null;
	}
}

// filter out WebmentionChildren
export function filterWebmentions(webmentions: WebmentionsChildren[]) {
	return webmentions.filter((webmention) => {
		// make sure the mention has a property so we can sort them later
		if (!validWebmentionTypes.includes(webmention["wm-property"])) return false;

		// make sure 'mention-of' or 'in-reply-to' has text content.
		if (webmention["wm-property"] === "mention-of" || webmention["wm-property"] === "in-reply-to") {
			return webmention.content && webmention.content.text !== "";
		}

		return true;
	});
}

// Fetch and cache webmentions in memory (Cloudflare Workers compatible)
async function getAndCacheWebmentions(): Promise<WebmentionsChildren[]> {
	// Return cached data if available (within same build/request)
	if (cachedWebmentions !== null) {
		return cachedWebmentions;
	}

	const mentions = await fetchWebmentions(null);

	if (mentions) {
		cachedWebmentions = filterWebmentions(mentions.children);
		return cachedWebmentions;
	}

	// Return empty array if fetch failed
	cachedWebmentions = [];
	return cachedWebmentions;
}

export async function getWebmentionsForUrl(url: string) {
	const webmentions = await getAndCacheWebmentions();
	return webmentions.filter((entry) => entry["wm-target"] === url);
}
