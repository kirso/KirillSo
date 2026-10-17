/// <reference types="astro/client" />
// Adds hName/hProperties to mdast node data, used by the remark plugins
/// <reference types="mdast-util-to-hast" />

declare module "@pagefind/default-ui" {
	class PagefindUI {
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
