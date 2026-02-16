const { availableRankings } = require('../../eleventy/lib/utils');
const { SPORTS } = require('../../eleventy/lib/constants');

module.exports = async function () {
	const result = {};
	for (const [sportKey, sportConfig] of Object.entries(SPORTS)) {
		result[sportKey] = await availableRankings(sportConfig.dbSport);
	}
	return result;
};
