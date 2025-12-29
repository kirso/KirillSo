import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { fetchReadwiseHighlights } from "@/lib/readwise";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const baseSchema = z.object({
	title: z.string().max(60),
});

const post = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
					credit: z.string().optional(),
				})
				.optional(),
			draft: z.boolean().default(false),
			pinned: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
		}),
});

const note = defineCollection({
	loader: glob({ base: "./src/content/note", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		description: z.string().optional(),
		publishDate: z
			.string()
			.datetime({ offset: true }) // Ensures ISO 8601 format with offsets allowed (e.g. "2024-01-01T00:00:00Z" and "2024-01-01T00:00:00+02:00")
			.transform((val) => new Date(val)),
	}),
});

/**
 * Readwise highlights collection
 * Fetches from Readwise API at build time if READWISE_TOKEN is set
 * Falls back to empty array if token not available (dev without token)
 */
const highlight = defineCollection({
	loader: async () => {
		// Try both import.meta.env and process.env for compatibility
		const token = import.meta.env.READWISE_TOKEN || process.env.READWISE_TOKEN;
		if (!token) {
			console.warn("READWISE_TOKEN not set, skipping highlights fetch");
			return [];
		}

		try {
			console.log("Fetching highlights from Readwise...");
			const highlights = await fetchReadwiseHighlights(token);
			console.log(`Fetched ${highlights.length} highlights from Readwise`);

			// Filter out highlights with incomplete data and map to collection format
			const validHighlights = highlights
				.filter((hl) => hl.bookId && hl.bookTitle && hl.text)
				.map((hl) => ({
					id: hl.id,
					text: hl.text,
					note: hl.note || "",
					highlightedAt: hl.highlightedAt?.toISOString() ?? null,
					bookId: hl.bookId,
					bookTitle: hl.bookTitle,
					bookAuthor: hl.bookAuthor || "Unknown",
					bookCategory: hl.bookCategory || "uncategorized",
					bookCover: hl.bookCover || "",
					tags: hl.tags || [],
				}));

			console.log(`Loaded ${validHighlights.length} valid highlights`);
			return validHighlights;
		} catch (error) {
			console.error("Failed to fetch Readwise highlights:", error);
			return [];
		}
	},
	schema: z.object({
		text: z.string(),
		note: z.string(),
		highlightedAt: z.string().nullable(),
		bookId: z.number(),
		bookTitle: z.string(),
		bookAuthor: z.string(),
		bookCategory: z.string(),
		bookCover: z.string(),
		tags: z.array(z.string()),
	}),
});

export const collections = { post, note, highlight };
