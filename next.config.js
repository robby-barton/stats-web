// @ts-check

// next.config.js
const nextConfig = {
	output: 'export',
	crossOrigin: 'anonymous',
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
};

module.exports = nextConfig;
