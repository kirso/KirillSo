<script lang="ts">
interface Props {
	initialMessage?: string;
}

interface Message {
	text: string;
	isUser: boolean;
	isStreaming?: boolean;
}

const { initialMessage = "Hi! Ask me anything about my experience and background." }: Props =
	$props();

// State
let isOpen = $state(false);
let isStreaming = $state(false);
let isLoading = $state(false);
let inputValue = $state("");
let messages = $state<Message[]>([{ text: initialMessage, isUser: false }]);

// Resize state
let isResizing = $state(false);
let chatHeight = $state(384);
let startY = $state(0);
let startHeight = $state(0);

// Refs
let inputRef: HTMLInputElement | undefined = $state();
let messagesRef: HTMLDivElement | undefined = $state();
let chatWindowRef: HTMLDivElement | undefined = $state();

// Derived
const canSubmit = $derived(!isStreaming && !isLoading && inputValue.trim().length > 0);

// Effects
$effect(() => {
	if (isOpen && inputRef) {
		inputRef.focus();
	}
});

$effect(() => {
	// Scroll to bottom when messages change
	if (messagesRef) {
		messagesRef.scrollTop = messagesRef.scrollHeight;
	}
});

// Keyboard handling
function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Escape" && isOpen) {
		isOpen = false;
	}
}

// Toggle chat
function toggleChat() {
	isOpen = !isOpen;
}

function closeChat() {
	isOpen = false;
}

// Resize handling
function startResize(e: MouseEvent) {
	if (!chatWindowRef) return;
	const rect = chatWindowRef.getBoundingClientRect();
	// Only allow resize from top 10px
	if (e.clientY > rect.top + 10) return;

	isResizing = true;
	startY = e.clientY;
	startHeight = chatHeight;

	document.addEventListener("mousemove", handleResize);
	document.addEventListener("mouseup", stopResize);
}

function handleResize(e: MouseEvent) {
	if (!isResizing) return;
	const delta = startY - e.clientY;
	const newHeight = Math.min(Math.max(startHeight + delta, 384), window.innerHeight * 0.8);
	chatHeight = newHeight;
}

function stopResize() {
	isResizing = false;
	document.removeEventListener("mousemove", handleResize);
	document.removeEventListener("mouseup", stopResize);
}

// Form submission
async function handleSubmit(e: Event) {
	e.preventDefault();
	if (!canSubmit) return;

	const message = inputValue.trim();
	inputValue = "";
	isLoading = true;

	// Add user message
	messages = [...messages, { text: message, isUser: true }];

	try {
		const formData = new FormData();
		formData.append("message", message);

		const response = await fetch("/api/chat", {
			method: "POST",
			body: formData,
		});

		if (response.status === 429) {
			messages = [
				...messages,
				{
					text: "You've sent too many messages. Please wait a minute and try again.",
					isUser: false,
				},
			];
			return;
		}

		if (!response.ok) throw new Error("Failed to send message");

		const reader = response.body?.getReader();
		if (!reader) throw new Error("No response stream");

		isStreaming = true;
		let accumulatedText = "";

		// Add streaming message placeholder
		messages = [...messages, { text: "", isUser: false, isStreaming: true }];

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const chunk = new TextDecoder().decode(value);
			accumulatedText += chunk;

			// Update the streaming message
			messages = messages.map((msg, i) =>
				i === messages.length - 1 ? { ...msg, text: accumulatedText } : msg,
			);
		}

		// Finalize message
		messages = messages.map((msg, i) =>
			i === messages.length - 1 ? { ...msg, isStreaming: false } : msg,
		);

		isStreaming = false;
	} catch (error) {
		console.error("Chat error:", error);
		const errorMsg = error instanceof Error ? error.message : "Unknown error";
		messages = [
			...messages,
			{
				text: `Sorry, there was an error: ${errorMsg}`,
				isUser: false,
			},
		];
	} finally {
		isLoading = false;
		isStreaming = false;
	}
}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed right-5 bottom-20 z-50">
	<button
		class="border border-[var(--color-border)] bg-[var(--color-global-bg)] px-4 py-2 text-sm font-medium text-[var(--color-global-text)] transition-all hover:border-[var(--color-global-text)] hover:bg-[var(--color-global-text)] hover:text-[var(--color-global-bg)]"
		aria-label={isOpen ? "Close chat" : "Open chat"}
		aria-expanded={isOpen}
		onclick={toggleChat}
	>
		Chat →
	</button>

	{#if isOpen}
		<div
			bind:this={chatWindowRef}
			class="absolute right-0 bottom-12 flex flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-global-bg)] shadow-lg"
			style="height: {chatHeight}px; width: 320px; max-height: 80vh; min-height: 384px;"
			role="dialog"
			aria-label="Chat window"
			aria-modal="true"
			onmousedown={startResize}
		>
			<!-- Resize handle indicator -->
			<div
				class="absolute top-0 right-0 left-0 h-2 cursor-ns-resize bg-[var(--color-border)] opacity-0 transition-opacity hover:opacity-50"
			></div>

			<!-- Header -->
			<div
				class="flex items-center justify-between border-b border-[var(--color-border)] p-3"
			>
				<span class="text-sm font-medium text-[var(--color-global-text)]">Chat with me</span>
				<button
					class="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-global-text)]"
					aria-label="Close chat"
					onclick={closeChat}
				>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path
							d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
						></path>
					</svg>
				</button>
			</div>

			<!-- Messages -->
			<div
				bind:this={messagesRef}
				class="flex flex-grow flex-col gap-3 overflow-y-auto p-4 text-sm [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-border)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
				aria-live="polite"
				aria-label="Chat messages"
			>
				{#each messages as message}
					<div
						class="max-w-[85%] p-3 {message.isUser
							? 'ml-auto border border-[var(--color-global-text)] bg-[var(--color-global-text)] text-[var(--color-global-bg)]'
							: 'border border-[var(--color-border)] text-[var(--color-global-text)]'}"
					>
						{#if message.isStreaming && !message.text}
							<div class="typing-indicator">
								<div class="dot-flashing"></div>
							</div>
						{:else}
							{message.text}
						{/if}
					</div>
				{/each}

				{#if isLoading && !isStreaming}
					<div
						class="max-w-[85%] border border-[var(--color-border)] p-3 text-[var(--color-global-text)]"
					>
						<div class="typing-indicator">
							<div class="dot-flashing"></div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Input form -->
			<form
				class="border-t border-[var(--color-border)] p-3"
				onsubmit={handleSubmit}
			>
				<input
					bind:this={inputRef}
					bind:value={inputValue}
					type="text"
					placeholder="Type your message..."
					class="mb-2 w-full border border-[var(--color-border)] bg-[var(--color-global-bg)] p-2 text-sm text-[var(--color-global-text)] outline-none focus:border-[var(--color-global-text)] disabled:opacity-50"
					disabled={isStreaming || isLoading}
					aria-label="Message input"
				/>
				<button
					type="submit"
					class="w-full border border-[var(--color-global-text)] bg-[var(--color-global-text)] px-4 py-2 text-sm font-medium text-[var(--color-global-bg)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!canSubmit}
				>
					{isLoading ? "Sending..." : "Send"}
				</button>
			</form>
		</div>
	{/if}
</div>

<style>
	@keyframes dot-flashing {
		0% {
			background-color: currentColor;
		}
		50%,
		100% {
			background-color: rgba(155, 155, 155, 0.2);
		}
	}

	.typing-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 0;
	}

	.dot-flashing {
		position: relative;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: currentColor;
		animation: dot-flashing 1s infinite linear alternate;
		animation-delay: 0.5s;
	}

	.dot-flashing::before,
	.dot-flashing::after {
		content: "";
		display: inline-block;
		position: absolute;
		top: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: currentColor;
	}

	.dot-flashing::before {
		left: -12px;
		animation: dot-flashing 1s infinite alternate;
		animation-delay: 0s;
	}

	.dot-flashing::after {
		left: 12px;
		animation: dot-flashing 1s infinite alternate;
		animation-delay: 1s;
	}
</style>
