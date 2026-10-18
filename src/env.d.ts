/// <reference types="astro/client" />

declare module "@pagefind/default-ui" {
	class PagefindUI {
		constructor(arg: unknown);
	}
}

// GOOGLE_AI_API_KEY is read through astro:env; only the build script reads it from process.env
interface ImportMetaEnv {
	readonly PUBLIC_ENABLE_CHAT: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
	interface ProcessEnv {
		readonly GOOGLE_AI_API_KEY: string;
		readonly PUBLIC_ENABLE_CHAT: string;
	}
}
