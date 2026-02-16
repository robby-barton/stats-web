const { availableRankings } = require('../../eleventy/lib/utils');
const { SPORTS } = require('../../eleventy/lib/constants');

module.exports = async function () {
	const nav = {};
	for (const [sportKey, sportConfig] of Object.entries(SPORTS)) {
		const avail = await availableRankings(sportConfig.dbSport);
		const years = Object.keys(avail).sort().reverse();
		if (!years.length) continue;

		const latestYear = years[0];
		const yearInfo = avail[latestYear];
		const division = sportConfig.divisions[0];
		const week = yearInfo.postseason ? 'final' : yearInfo.weeks.toString();

		nav[sportKey] = `/${sportKey}/ranking/${division}/${latestYear}/${week}/`;
	}
	return nav;
};
