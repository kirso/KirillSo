/**
 * Readwise API integration for fetching highlights
 * API docs: https://readwise.io/api_deets
 */

export interface ReadwiseHighlight {
	id: number;
	text: string;
	note: string;
	location: number;
	location_type: string;
	highlighted_at: string | null;
	url: string | null;
	color: string;
	updated: string;
	book_id: number;
	tags: Array<{ id: number; name: string }>;
}

export interface ReadwiseBook {
	id: number;
	title: string;
	author: string;
	category: string;
	source: string;
	num_highlights: number;
	last_highlight_at: string | null;
	updated: string;
	cover_image_url: string;
	highlights_url: string;
	source_url: string | null;
	asin: string;
	tags: Array<{ id: number; name: string }>;
}

export interface ReadwiseExportResult {
	user_book_id: number;
	title: string;
	author: string;
	category: string;
	source: string;
	cover_image_url: string;
	highlights: Array<{
		id: number;
		text: string;
		note: string;
		location: number;
		location_type: string;
		highlighted_at: string | null;
		url: string | null;
		color: string;
		updated: string;
		book_id: number;
		tags: Array<{ id: number; name: string }>;
	}>;
}

export interface HighlightEntry {
	id: string;
	text: string;
	note: string;
	highlightedAt: Date | null;
	bookId: number;
	bookTitle: string;
	bookAuthor: string;
	bookCategory: string;
	bookCover: string;
	tags: string[];
}

/**
 * Fetch all highlights from Readwise using the export endpoint
 * This is more efficient than paginating through highlights individually
 */
export async function fetchReadwiseHighlights(
	token: string,
	updatedAfter?: Date
): Promise<HighlightEntry[]> {
	const highlights: HighlightEntry[] = [];
	let nextPageCursor: string | null = null;

	do {
		const params = new URLSearchParams();
		if (updatedAfter) {
			params.set("updatedAfter", updatedAfter.toISOString());
		}
		if (nextPageCursor) {
			params.set("pageCursor", nextPageCursor);
		}

		const url = `https://readwise.io/api/v2/export/?${params.toString()}`;
		const response = await fetch(url, {
			headers: {
				Authorization: `Token ${token}`,
			},
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error("Invalid Readwise API token");
			}
			throw new Error(`Readwise API error: ${response.status}`);
		}

		const data = await response.json();
		nextPageCursor = data.nextPageCursor;

		// Process each book and its highlights
		for (const book of data.results as ReadwiseExportResult[]) {
			// Skip books without required fields
			if (!book.user_book_id || !book.title) continue;

			for (const hl of book.highlights) {
				// Skip highlights without text
				if (!hl.text || !hl.id) continue;

				highlights.push({
					id: `hl-${hl.id}`,
					text: hl.text,
					note: hl.note || "",
					highlightedAt: hl.highlighted_at ? new Date(hl.highlighted_at) : null,
					bookId: book.user_book_id,
					bookTitle: book.title,
					bookAuthor: book.author || "Unknown",
					bookCategory: book.category || "uncategorized",
					bookCover: book.cover_image_url || "",
					tags: hl.tags?.map((t) => t.name) || [],
				});
			}
		}
	} while (nextPageCursor);

	return highlights;
}

/**
 * Group highlights by book for display
 */
export function groupHighlightsByBook(
	highlights: HighlightEntry[]
): Map<number, { book: { id: number; title: string; author: string; category: string; cover: string }; highlights: HighlightEntry[] }> {
	const grouped = new Map<number, { book: { id: number; title: string; author: string; category: string; cover: string }; highlights: HighlightEntry[] }>();

	for (const hl of highlights) {
		if (!grouped.has(hl.bookId)) {
			grouped.set(hl.bookId, {
				book: {
					id: hl.bookId,
					title: hl.bookTitle,
					author: hl.bookAuthor,
					category: hl.bookCategory,
					cover: hl.bookCover,
				},
				highlights: [],
			});
		}
		grouped.get(hl.bookId)!.highlights.push(hl);
	}

	return grouped;
}
