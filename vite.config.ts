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
			'@pages': path.resolve(__dirname, 'pages'),
			'next/link': path.resolve(__dirname, 'src/shims/next-link.tsx'),
			'next/router': path.resolve(__dirname, 'src/shims/next-router.ts'),
			'next/image': path.resolve(__dirname, 'src/shims/next-image.tsx'),
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
				team: path.resolve(__dirname, 'src/client/team.tsx'),
				gameCount: path.resolve(__dirname, 'src/client/game-count.tsx'),
				themeToggle: path.resolve(__dirname, 'src/client/theme-toggle.tsx'),
			},
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name].js',
				assetFileNames: 'assets/[name][extname]',
			},
		},
	},
});
