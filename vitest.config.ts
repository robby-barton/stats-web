import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/*.test.{js,ts,mjs}'],
		exclude: ['node_modules/**', 'src/assets/build/**', '_site/**'],
	},
});
