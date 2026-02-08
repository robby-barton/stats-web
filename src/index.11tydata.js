const { availableRankings, getRanking } = require('../eleventy/lib/utils');

module.exports = async function () {
	const avail = await availableRankings();
	let year = -1;
	for (const key in avail) {
		const keyNum = Number(key);
		if (keyNum > year) {
			year = keyNum;
		}
	}

	const currYear = avail[year.toString()];
	const week = currYear.postseason ? 'final' : currYear.weeks.toString();
	const ranking = await getRanking(true, year, week);

	return {
		title: null,
		description: 'Computer rankings for to FBS and FCS college football seasons.',
		islandScript: '/assets/build/ranking.js',
		rankingData: {
			availRanks: avail,
			ranking,
			division: 'fbs',
			year,
			week,
		},
	};
};
