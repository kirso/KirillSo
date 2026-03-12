/**
 * Shared utilities for book data parsing and display.
 * Used by reading.astro and YearTabs.svelte.
 */

export interface GoodreadsBook {
  title: string;
  author: string;
  link?: string | undefined;
}

export interface YearData {
  year: number;
  books: GoodreadsBook[];
}

/**
 * Smart title truncation that preserves meaning.
 * Priority: remove parentheticals first (edition info), then subtitles.
 */
export function cleanTitle(title: string, maxLength = 60): string {
  if (title.length <= maxLength) return title;

  // First try: cut at " (" - parentheticals are usually edition/series info
  const parenIndex = title.indexOf(" (");
  if (parenIndex >= 15) {
    const beforeParen = title.slice(0, parenIndex).trim();
    if (beforeParen.length <= maxLength) return beforeParen;
  }

  // Second try: cut at " - " (common subtitle separator)
  const dashIndex = title.indexOf(" - ");
  if (dashIndex >= 15) {
    const beforeDash = title.slice(0, dashIndex).trim();
    if (beforeDash.length <= maxLength) return beforeDash;
  }

  // Third try: cut at colon (subtitle)
  const colonIndex = title.indexOf(":");
  if (colonIndex >= 15) {
    const beforeColon = title.slice(0, colonIndex).trim();
    if (beforeColon.length <= maxLength) return beforeColon;
  }

  // Fallback: truncate at word boundary
  const truncated = title.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.6) {
    return truncated.slice(0, lastSpace) + "\u2026";
  }
  return truncated + "\u2026";
}

/**
 * Parse Goodreads RSS XML into a list of books.
 * When includeDate is true, each book includes its read date.
 */
export function parseGoodreadsRSS(xml: string, includeDate = false): Array<GoodreadsBook & { readAt?: Date | undefined }> {
  const books: Array<GoodreadsBook & { readAt?: Date | undefined }> = [];
  const items = xml.split("<item>").slice(1);

  for (const item of items) {
    const endIndex = item.indexOf("</item>");
    const itemContent = endIndex > -1 ? item.substring(0, endIndex) : item;

    // Extract title from CDATA
    const titleStart = itemContent.indexOf("<title><![CDATA[");
    const titleEnd = itemContent.indexOf("]]></title>");
    const title = titleStart > -1 && titleEnd > -1
      ? itemContent.substring(titleStart + 16, titleEnd)
      : null;

    // Extract author
    const authorStart = itemContent.indexOf("<author_name>");
    const authorEnd = itemContent.indexOf("</author_name>");
    const author = authorStart > -1 && authorEnd > -1
      ? itemContent.substring(authorStart + 13, authorEnd)
      : "Unknown";

    // Extract book_id to build book page URL (more useful than review page)
    const bookIdStart = itemContent.indexOf("<book_id>");
    const bookIdEnd = itemContent.indexOf("</book_id>");
    const bookId = bookIdStart > -1 && bookIdEnd > -1
      ? itemContent.substring(bookIdStart + 9, bookIdEnd).trim()
      : undefined;
    const link = bookId ? `https://www.goodreads.com/book/show/${bookId}` : undefined;

    // Extract read date if requested
    // Priority: user_read_at (date read) > user_date_created (original add date shown in Goodreads UI)
    let readAt: Date | undefined;
    if (includeDate) {
      // Try user_read_at first (the "date read" field) - has CDATA wrapper when set
      const readAtStart = itemContent.indexOf("<user_read_at><![CDATA[");
      const readAtEnd = itemContent.indexOf("]]></user_read_at>");
      if (readAtStart > -1 && readAtEnd > -1) {
        const dateStr = itemContent.substring(readAtStart + 23, readAtEnd).trim();
        if (dateStr) {
          readAt = new Date(dateStr);
        }
      }
      // Fall back to user_date_created (original date - matches "date added" in Goodreads UI)
      if (!readAt) {
        const createdStart = itemContent.indexOf("<user_date_created><![CDATA[");
        const createdEnd = itemContent.indexOf("]]></user_date_created>");
        if (createdStart > -1 && createdEnd > -1) {
          const dateStr = itemContent.substring(createdStart + 28, createdEnd).trim();
          if (dateStr) {
            readAt = new Date(dateStr);
          }
        }
      }
    }

    if (title) {
      books.push({ title, author, link, readAt });
    }
  }

  return books;
}
