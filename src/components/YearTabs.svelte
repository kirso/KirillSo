<script lang="ts">
/**
 * YearTabs — Year selector for book lists
 * Uses a clean dropdown for many years, follows Quiet Archive design
 */
import { cleanTitle } from "@/utils/books";
import type { YearData } from "@/utils/books";

interface Props {
	years: YearData[];
}

const { years }: Props = $props();

// Sort years descending (newest first)
const sortedYears = $derived([...years].sort((a, b) => b.year - a.year));

// Total books count
const totalBooks = $derived(sortedYears.reduce((sum, y) => sum + y.books.length, 0));

// Active tab state — user selection overrides the default (first year)
let userSelection = $state<number | undefined>(undefined);
const activeYear = $derived(userSelection ?? sortedYears[0]?.year ?? new Date().getFullYear());

function onYearChange(e: Event) {
	userSelection = Number((e.target as HTMLSelectElement).value);
}

// Get books for active year
const activeBooks = $derived(
	sortedYears.find((y) => y.year === activeYear)?.books ?? []
);
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
				value={activeYear}
				onchange={onYearChange}
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
	<div class="book-panel" role="region" aria-label="Books from {activeYear}">
		{#if activeBooks.length === 0}
			<p class="empty-state">No books recorded for {activeYear}.</p>
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

</style>
