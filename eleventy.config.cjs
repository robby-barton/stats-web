module.exports = function (eleventyConfig) {
	const { serializeJson } = require('./eleventy/lib/serialize');

	eleventyConfig.on('eleventy.before', () => {
		const { clearCaches } = require('./eleventy/lib/utils');
		clearCaches();
	});

	eleventyConfig.addFilter('json', serializeJson);

	eleventyConfig.addPassthroughCopy({ public: '.' });
	eleventyConfig.addPassthroughCopy({ 'src/assets/build': 'assets/build' });

	return {
		dir: {
			input: 'src',
			output: '_site',
			includes: '_includes',
		},
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		templateFormats: ['njk', 'md', 'html', '11ty.js'],
	};
};
