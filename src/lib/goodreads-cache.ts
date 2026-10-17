/**
 * Goodreads RSS response caching using Cloudflare Workers Cache API.
 * Falls back to direct fetch when Cache API is unavailable (local dev).
 */

const CACHE_TTL = 3600; // 1 hour in seconds

// Goodreads returns 403 to requests without a User-Agent (the Workers runtime sends none)
const FETCH_INIT: RequestInit = {
	headers: { "User-Agent": "kirillso.com reading page (+https://www.kirillso.com/reading/)" },
};

export async function fetchCachedGoodreadsXML(url: string): Promise<string | null> {
	try {
		// Try Cloudflare Cache API
		const cache = (caches as any).default;
		if (cache) {
			const cacheKey = new Request(url);
			const cached = await cache.match(cacheKey);
			if (cached) {
				return cached.text();
			}

			const response = await fetch(url, FETCH_INIT);
			if (!response.ok) return null;

			const xml = await response.text();

			// Cache the response
			const cacheResponse = new Response(xml, {
				headers: {
					"Content-Type": "application/xml",
					"Cache-Control": `public, s-maxage=${CACHE_TTL}`,
				},
			});
			// Await: an unawaited put can be cut off when the response ends, caching an empty body
			await cache.put(cacheKey, cacheResponse);

			return xml;
		}
	} catch {
		// Cache API not available (local dev), fall through
	}

	// Fallback: direct fetch
	try {
		const response = await fetch(url, FETCH_INIT);
		if (!response.ok) return null;
		return response.text();
	} catch {
		return null;
	}
}
