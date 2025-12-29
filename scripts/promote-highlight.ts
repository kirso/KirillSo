#!/usr/bin/env bun
/**
 * Promote a Readwise highlight to a note
 *
 * Usage:
 *   bun run promote-highlight              # Interactive browser
 *   bun run promote-highlight hl-123456   # Direct with ID
 */

import { fetchReadwiseHighlights, groupHighlightsByBook } from "../src/lib/readwise";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import * as readline from "readline";

const NOTES_DIR = join(import.meta.dir, "../src/content/note");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function truncate(text: string, len: number): string {
  const clean = text.replace(/\n/g, " ").trim();
  return clean.length > len ? clean.slice(0, len - 1) + "…" : clean;
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const token = process.env.READWISE_TOKEN;
  if (!token) {
    console.error("Error: READWISE_TOKEN not set in environment");
    process.exit(1);
  }

  console.log("Fetching highlights from Readwise...\n");
  const highlights = await fetchReadwiseHighlights(token);
  const grouped = groupHighlightsByBook(highlights);
  const books = Array.from(grouped.values());

  // Direct mode with ID
  const directId = process.argv[2];
  if (directId) {
    const highlight = highlights.find((hl) => hl.id === directId);
    if (!highlight) {
      console.error(`Highlight not found: ${directId}`);
      process.exit(1);
    }
    await createNote(highlight);
    return;
  }

  // Interactive mode
  console.log(`Found ${books.length} books with ${highlights.length} total highlights.\n`);

  const searchQuery = await prompt("Search books (or press Enter to browse all): ");

  let filteredBooks = books;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredBooks = books.filter(
      (b) => b.book.title.toLowerCase().includes(q) || b.book.author.toLowerCase().includes(q)
    );
    if (filteredBooks.length === 0) {
      console.log("No matches found.");
      process.exit(0);
    }
    console.log(`\nFound ${filteredBooks.length} matching books:\n`);
  } else {
    console.log("\nBooks (sorted by highlight count):\n");
    filteredBooks = [...books].sort((a, b) => b.highlights.length - a.highlights.length);
  }

  // Paginated book display
  const PAGE_SIZE = 20;
  let bookPage = 0;
  let selectedBook: typeof books[0] | null = null;

  while (!selectedBook) {
    const start = bookPage * PAGE_SIZE;
    const pageBooks = filteredBooks.slice(start, start + PAGE_SIZE);

    pageBooks.forEach((group, i) => {
      console.log(`  ${start + i + 1}. ${truncate(group.book.title, 50)} (${group.highlights.length})`);
    });

    const hasMore = start + PAGE_SIZE < filteredBooks.length;
    const hasPrev = bookPage > 0;

    let options = "Book number";
    if (hasMore) options += ", 'n' for next";
    if (hasPrev) options += ", 'p' for prev";
    options += ", 'q' to quit: ";

    const bookChoice = await prompt(`\n${options}`);
    if (bookChoice === "q") process.exit(0);
    if (bookChoice === "n" && hasMore) { bookPage++; console.log(""); continue; }
    if (bookChoice === "p" && hasPrev) { bookPage--; console.log(""); continue; }

    const bookIndex = parseInt(bookChoice) - 1;
    if (!isNaN(bookIndex) && bookIndex >= 0 && bookIndex < filteredBooks.length) {
      selectedBook = filteredBooks[bookIndex];
    } else {
      console.log("Invalid selection, try again.");
    }
  }

  // Paginated highlight display
  console.log(`\nHighlights from "${selectedBook.book.title}":\n`);

  let hlPage = 0;
  const HL_PAGE_SIZE = 15;

  while (true) {
    const start = hlPage * HL_PAGE_SIZE;
    const pageHighlights = selectedBook.highlights.slice(start, start + HL_PAGE_SIZE);

    pageHighlights.forEach((hl, i) => {
      console.log(`  ${start + i + 1}. "${truncate(hl.text, 70)}"`);
    });

    const hasMore = start + HL_PAGE_SIZE < selectedBook.highlights.length;
    const hasPrev = hlPage > 0;

    let options = "Highlight number";
    if (hasMore) options += ", 'n' for next";
    if (hasPrev) options += ", 'p' for prev";
    options += ", 'q' to quit: ";

    const hlChoice = await prompt(`\n${options}`);
    if (hlChoice === "q") process.exit(0);
    if (hlChoice === "n" && hasMore) { hlPage++; console.log(""); continue; }
    if (hlChoice === "p" && hasPrev) { hlPage--; console.log(""); continue; }

    const hlIndex = parseInt(hlChoice) - 1;
    if (!isNaN(hlIndex) && hlIndex >= 0 && hlIndex < selectedBook.highlights.length) {
      await createNote(selectedBook.highlights[hlIndex]);
      break;
    } else {
      console.log("Invalid selection, try again.");
    }
  }
}

async function createNote(highlight: Awaited<ReturnType<typeof fetchReadwiseHighlights>>[0]) {
  const today = new Date();
  const dateStr = formatDate(today);
  const titleSlug = slugify(highlight.text.slice(0, 30));
  const filename = `${dateStr}-${titleSlug}.md`;
  const filepath = join(NOTES_DIR, filename);

  if (existsSync(filepath)) {
    console.error(`File already exists: ${filepath}`);
    process.exit(1);
  }

  const noteContent = `---
title: "On ${highlight.bookTitle}"
publishDate: "${today.toISOString()}"
---

> ${highlight.text.replace(/\n/g, "\n> ")}

— ${highlight.bookAuthor}, *${highlight.bookTitle}*

---

<!-- Your commentary here -->

`;

  writeFileSync(filepath, noteContent);
  console.log(`\n✓ Created: ${filename}`);
  console.log(`  Path: ${filepath}`);
  console.log(`\nEdit the file to add your commentary.`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
