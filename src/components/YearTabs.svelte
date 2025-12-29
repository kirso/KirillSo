<script lang="ts">
/**
 * YearTabs — Year selector for book lists
 * Uses a clean dropdown for many years, follows Quiet Archive design
 */
import { onMount } from "svelte";

interface Book {
	title: string;
	author: string;
	link?: string;
}

interface YearData {
	year: number;
	books: Book[];
}

interface Props {
	years: YearData[];
}

const { years }: Props = $props();

// Hydration state
let mounted = $state(false);
onMount(() => {
	mounted = true;
});

// Sort years descending (newest first)
const sortedYears = $derived([...years].sort((a, b) => b.year - a.year));

// Total books count
const totalBooks = $derived(sortedYears.reduce((sum, y) => sum + y.books.length, 0));

// Default year (derived to handle reactivity)
const defaultYear = $derived(sortedYears[0]?.year ?? new Date().getFullYear());

// Active tab state
let activeYear = $state<number | null>(null);
const currentYear = $derived(activeYear ?? defaultYear);

// Get books for active year
const activeBooks = $derived(
	sortedYears.find((y) => y.year === currentYear)?.books ?? []
);

// Smart title truncation
function cleanTitle(title: string, maxLength = 60): string {
	if (title.length <= maxLength) return title;

	const parenIndex = title.indexOf(" (");
	if (parenIndex >= 15) {
		const beforeParen = title.slice(0, parenIndex).trim();
		if (beforeParen.length <= maxLength) return beforeParen;
	}

	const dashIndex = title.indexOf(" - ");
	if (dashIndex >= 15) {
		const beforeDash = title.slice(0, dashIndex).trim();
		if (beforeDash.length <= maxLength) return beforeDash;
	}

	const colonIndex = title.indexOf(":");
	if (colonIndex >= 15) {
		const beforeColon = title.slice(0, colonIndex).trim();
		if (beforeColon.length <= maxLength) return beforeColon;
	}

	const truncated = title.slice(0, maxLength - 1);
	const lastSpace = truncated.lastIndexOf(" ");
	if (lastSpace > maxLength * 0.6) {
		return truncated.slice(0, lastSpace) + "…";
	}
	return truncated + "…";
}
</script>

<div class="year-selector">
	<!-- Year dropdown with total count -->
	<div class="selector-row">
		<label class="selector-label" for="year-select">
			<span class="total-count">{totalBooks} books</span>
		</label>
		<div class="select-wrapper">
			<select
				id="year-select"
				bind:value={activeYear}
				class="year-select"
			>
				{#each sortedYears as { year, books } (year)}
					<option value={year}>
						{year} ({books.length})
					</option>
				{/each}
			</select>
			<span class="select-arrow" aria-hidden="true">▾</span>
		</div>
	</div>

	<!-- Book list -->
	<div class="book-panel" role="region" aria-label="Books from {currentYear}">
		{#if !mounted}
			<div class="skeleton-list">
				{#each {length: 5} as _, i (i)}
					<div class="skeleton-row">
						<span class="skeleton-title"></span>
						<span class="skeleton-author"></span>
					</div>
				{/each}
			</div>
		{:else if activeBooks.length === 0}
			<p class="empty-state">No books recorded for {currentYear}.</p>
		{:else}
			<ul class="book-list">
				{#each activeBooks as book, i (book.title + i)}
					<li class="ruler-notch">
						<div class="post-row">
							{#if book.link}
								<a
									class="post-title link"
									href={book.link}
									target="_blank"
									rel="noopener noreferrer"
									title={book.title}
								>
									{cleanTitle(book.title)}
								</a>
							{:else}
								<span class="post-title" title={book.title}>
									{cleanTitle(book.title)}
								</span>
							{/if}
							<span class="post-leader"></span>
							<span class="post-date mono">{book.author}</span>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.year-selector {
		/* Container */
	}

	.selector-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-rule);
	}

	.selector-label {
		font-size: var(--text-micro);
		color: var(--color-ink-tertiary);
	}

	.total-count {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	.select-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.year-select {
		appearance: none;
		background: transparent;
		border: 1px solid var(--color-rule);
		padding: var(--space-2) var(--space-6) var(--space-2) var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-variant-numeric: tabular-nums;
		color: var(--color-ink);
		cursor: pointer;
		min-width: 100px;
	}

	.year-select:hover {
		border-color: var(--color-ink-tertiary);
	}

	.year-select:focus {
		outline: none;
		border-color: var(--color-ink);
	}

	.select-arrow {
		position: absolute;
		right: var(--space-2);
		pointer-events: none;
		font-size: 0.7rem;
		color: var(--color-ink-tertiary);
	}

	.book-panel {
		min-height: 100px;
	}

	.book-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.empty-state {
		color: var(--color-ink-tertiary);
		font-style: italic;
	}

	/* Skeleton loading */
	.skeleton-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.skeleton-title {
		height: 1rem;
		width: 60%;
		background: var(--color-rule);
		opacity: 0.5;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-author {
		height: 0.875rem;
		width: 20%;
		background: var(--color-rule);
		opacity: 0.3;
		animation: pulse 1.5s ease-in-out infinite;
		animation-delay: 0.2s;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.6;
		}
	}
</style>
