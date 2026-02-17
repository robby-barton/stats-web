import path from 'path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
	plugins: [preact()],
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, 'components'),
			'@lib': path.resolve(__dirname, 'lib'),
			'@styles': path.resolve(__dirname, 'styles'),
			react: 'preact/compat',
			'react-dom': 'preact/compat',
			'react-dom/client': 'preact/compat',
			'react/jsx-runtime': 'preact/jsx-runtime',
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
