/// <reference types="astro/client" />

declare module "@pagefind/default-ui" {
	declare class PagefindUI {
		constructor(arg: unknown);
	}
}

declare namespace NodeJS {
	interface ProcessEnv {
		readonly OPENAI_API_KEY: string;
		readonly PUBLIC_ENABLE_CHAT: string;
	}
}
