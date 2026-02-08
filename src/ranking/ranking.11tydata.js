const { availableRankings, getRanking } = require('../../eleventy/lib/utils');

module.exports = {
	pagination: {
		data: 'rankingPaths',
		size: 1,
		alias: 'rankingPath',
	},
	permalink: (data) =>
		`/ranking/${data.rankingPath.params.division}/${data.rankingPath.params.year}/${data.rankingPath.params.week}/`,
	eleventyComputed: {
		islandScript: () => '/assets/build/ranking.js',
		title: (data) => {
			const division = data.rankingPath.params.division.toUpperCase();
			const week =
				data.rankingPath.params.week.toLowerCase() === 'final'
					? 'Final'
					: `Week ${data.rankingPath.params.week}`;
			return `${division} ${data.rankingPath.params.year} ${week}`;
		},
		description: (data) => {
			const division = data.rankingPath.params.division.toUpperCase();
			const week =
				data.rankingPath.params.week.toLowerCase() === 'final'
					? 'Final'
					: `Week ${data.rankingPath.params.week}`;
			return `${week} computer rankings for the ${data.rankingPath.params.year} ${division} college football season.`;
		},
		rankingData: async (data) => {
			const availRanks = await availableRankings();
			const division = data.rankingPath.params.division;
			const year = Number(data.rankingPath.params.year);
			const week = data.rankingPath.params.week;
			const ranking = await getRanking(division === 'fbs', year, week);
			return {
				availRanks,
				ranking,
				division,
				year,
				week,
			};
		},
	},
};
