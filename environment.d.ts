declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
			DEV_DATABASE_URL: string;
		}
	}
}

export {};
