// @ts-check

// next.config.js
const nextConfig = {
	output: 'export',
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
	trailingSlash: true,
};

module.exports = nextConfig;
