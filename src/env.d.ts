/// <reference types="astro/client" />

declare module "@pagefind/default-ui" {
	declare class PagefindUI {
		constructor(arg: unknown);
	}
}

interface ImportMetaEnv {
	readonly GOOGLE_AI_API_KEY: string;
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
