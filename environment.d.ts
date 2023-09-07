declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
			DEV_DATABASE_URL: string;
			REVALIDATE_SECRET: string;
		}
	}
}

export {};
