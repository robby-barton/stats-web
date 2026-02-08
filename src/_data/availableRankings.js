const { availableRankings } = require('../../eleventy/lib/utils');

module.exports = async function () {
	return availableRankings();
};
