// @ts-check

// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
	output: "standalone",
	experimental: {
		largePageDataBytes: 180 * 1000,
	},
});
