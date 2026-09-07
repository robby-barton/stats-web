import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, 'components'),
			'@lib': path.resolve(__dirname, 'lib'),
			'@styles': path.resolve(__dirname, 'styles'),
		},
	},
	test: {
		include: ['**/*.test.{js,ts,mjs}'],
		exclude: ['node_modules/**', 'src/assets/build/**', '_site/**'],
	},
});
