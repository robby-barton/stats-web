import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
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
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			input: {
				ranking: path.resolve(__dirname, 'src/client/ranking.tsx'),
				teams: path.resolve(__dirname, 'src/client/teams.tsx'),
				team: path.resolve(__dirname, 'src/client/team.ts'),
				gameCount: path.resolve(__dirname, 'src/client/game-count.tsx'),
			},
			output: {
				entryFileNames: '[name]-[hash].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]',
			},
		},
	},
});
