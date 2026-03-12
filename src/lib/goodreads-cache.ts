/**
 * Goodreads RSS response caching using Cloudflare Workers Cache API.
 * Falls back to direct fetch when Cache API is unavailable (local dev).
 */

const CACHE_TTL = 3600; // 1 hour in seconds

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

      const response = await fetch(url);
      if (!response.ok) return null;

      const xml = await response.text();

      // Cache the response
      const cacheResponse = new Response(xml, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": `public, s-maxage=${CACHE_TTL}`,
        },
      });
      // Don't await - fire and forget
      cache.put(cacheKey, cacheResponse);

      return xml;
    }
  } catch {
    // Cache API not available (local dev), fall through
  }

  // Fallback: direct fetch
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  }
}
