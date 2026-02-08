const { allGames } = require('../../eleventy/lib/utils');

module.exports = async function () {
	const games = await allGames();
	return {
		title: 'Game Count',
		description: 'Count of games played by day per team',
		islandScript: '/assets/build/gameCount.js',
		gameCountData: {
			games,
		},
	};
};
