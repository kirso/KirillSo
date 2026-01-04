<script lang="ts">
interface Props {
	title: string;
	url: string;
	author: string;
}

const { title, url, author }: Props = $props();

type AIService = "chatgpt" | "claude" | "perplexity";

let copied = $state<AIService | null>(null);
let contentElement: HTMLElement | null = null;

// Get the prose content from the page
function getArticleContent(): string {
	if (typeof document === "undefined") return "";

	// Find the prose container
	const prose = document.querySelector(".prose");
	if (!prose) return "";

	// Clone to avoid modifying the original
	const clone = prose.cloneNode(true) as HTMLElement;

	// Remove elements we don't want in the copy
	clone.querySelectorAll("script, style, .webmentions, .toc").forEach((el) => el.remove());

	// Get text content, preserving some structure
	return clone.innerText || clone.textContent || "";
}

function formatForAI(service: AIService): string {
	const content = getArticleContent();
	const header = `# ${title}\n\nSource: ${url}\nAuthor: ${author}\n\n---\n\n`;

	switch (service) {
		case "chatgpt":
			return `${header}${content}\n\n---\n\nPlease help me understand or discuss this article.`;
		case "claude":
			return `${header}${content}\n\n---\n\nI'd like to discuss this article with you.`;
		case "perplexity":
			return `${header}${content}`;
		default:
			return `${header}${content}`;
	}
}

async function copyToClipboard(service: AIService) {
	const text = formatForAI(service);

	try {
		await navigator.clipboard.writeText(text);
		copied = service;

		// Reset after 2 seconds
		setTimeout(() => {
			copied = null;
		}, 2000);
	} catch (err) {
		console.error("Failed to copy:", err);
	}
}

const services: { id: AIService; label: string }[] = [
	{ id: "chatgpt", label: "ChatGPT" },
	{ id: "claude", label: "Claude" },
	{ id: "perplexity", label: "Perplexity" },
];
</script>

<div class="copy-to-ai">
	<span class="label">Copy to</span>
	<div class="buttons">
		{#each services as service}
			<button
				class="ai-button"
				class:copied={copied === service.id}
				onclick={() => copyToClipboard(service.id)}
				aria-label={`Copy article for ${service.label}`}
			>
				{copied === service.id ? "Copied" : service.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.copy-to-ai {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 0;
		border-top: 1px solid var(--color-rule-light);
		margin-top: 48px;
	}

	.label {
		font-size: var(--text-micro);
		color: var(--color-ink-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.ai-button {
		padding: 6px 12px;
		font-size: var(--text-micro);
		font-weight: 500;
		background: var(--color-paper);
		color: var(--color-ink-secondary);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.ai-button:hover {
		border-color: var(--color-ink);
		color: var(--color-ink);
	}

	.ai-button.copied {
		background: var(--color-ink);
		color: var(--color-paper);
		border-color: var(--color-ink);
	}
</style>
