// @ts-check

// next.config.js
const nextConfig = {
	i18n: {
		locales: ['en'],
		defaultLocale: 'en',
	},
	output: 'standalone',
	experimental: {
		largePageDataBytes: 180 * 1000,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'a.espncdn.com',
				port: '',
				pathname: '/i/teamlogos/ncaa/**',
			},
		],
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: 'https://data.robby.tech/:path*',
			},
		];
	},
};

module.exports = nextConfig;
