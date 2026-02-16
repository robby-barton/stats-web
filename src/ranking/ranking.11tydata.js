const { availableRankings, getRanking } = require('../../eleventy/lib/utils');
const { SPORTS } = require('../../eleventy/lib/constants');

module.exports = {
	pagination: {
		data: 'rankingPaths',
		size: 1,
		alias: 'rankingPath',
	},
	permalink: (data) =>
		`/${data.rankingPath.params.sport}/ranking/${data.rankingPath.params.division}/${data.rankingPath.params.year}/${data.rankingPath.params.week}/`,
	eleventyComputed: {
		islandScript: () => '/assets/build/ranking.js',
		title: (data) => {
			const sport = data.rankingPath.params.sport;
			const sportLabel = sport.charAt(0).toUpperCase() + sport.slice(1);
			const division = data.rankingPath.params.division.toUpperCase();
			const week =
				data.rankingPath.params.week.toLowerCase() === 'final'
					? 'Final'
					: `Week ${data.rankingPath.params.week}`;
			return `${sportLabel} ${division} ${data.rankingPath.params.year} ${week}`;
		},
		description: (data) => {
			const sport = data.rankingPath.params.sport;
			const sportLabel = sport.charAt(0).toUpperCase() + sport.slice(1);
			const division = data.rankingPath.params.division.toUpperCase();
			const week =
				data.rankingPath.params.week.toLowerCase() === 'final'
					? 'Final'
					: `Week ${data.rankingPath.params.week}`;
			return `${week} computer rankings for the ${data.rankingPath.params.year} ${division} college ${sportLabel.toLowerCase()} season.`;
		},
		rankingData: async (data) => {
			const sport = data.rankingPath.params.sport;
			const dbSport = SPORTS[sport].dbSport;
			const availRanks = await availableRankings(dbSport);
			const division = data.rankingPath.params.division;
			const year = Number(data.rankingPath.params.year);
			const week = data.rankingPath.params.week;
			const fbs = division === 'fbs' || division === 'd1';
			const ranking = await getRanking(dbSport, fbs, year, week);
			return {
				availRanks,
				ranking,
				division,
				year,
				week,
				sport,
			};
		},
	},
};
