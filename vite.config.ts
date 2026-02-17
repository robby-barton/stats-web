import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	publicDir: false,
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, 'components'),
			'@lib': path.resolve(__dirname, 'lib'),
			'@styles': path.resolve(__dirname, 'styles'),
		},
	},
	build: {
		manifest: true,
		cssCodeSplit: false,
		outDir: 'src/assets/build',
		emptyOutDir: false,
		sourcemap: true,
		rollupOptions: {
			input: {
				ranking: path.resolve(__dirname, 'src/client/ranking.ts'),
				teams: path.resolve(__dirname, 'src/client/teams.ts'),
				team: path.resolve(__dirname, 'src/client/team.ts'),
				gameCount: path.resolve(__dirname, 'src/client/game-count.ts'),
			},
			output: {
				entryFileNames: '[name]-[hash].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]',
			},
		},
	},
});
