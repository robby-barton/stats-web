const path = require('path');

module.exports = function (eleventyConfig) {
	eleventyConfig.addFilter('json', (value) => JSON.stringify(value));

	eleventyConfig.addPassthroughCopy({ public: '.' });
	eleventyConfig.addPassthroughCopy({ 'src/assets/css': 'assets/css' });
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
