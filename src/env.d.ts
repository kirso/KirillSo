declare module "@pagefind/default-ui" {
	declare class PagefindUI {
		constructor(arg: unknown);
	}
}

interface ImportMetaEnv {
	readonly TURSO_DB_URL: string;
	readonly TURSO_DB_TOKEN: string;
	readonly OPENAI_API_KEY: string;
	readonly PUBLIC_ENABLE_CHAT: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
