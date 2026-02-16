const { getManifest } = require('../../eleventy/lib/manifest');

module.exports = function () {
	return getManifest();
};
