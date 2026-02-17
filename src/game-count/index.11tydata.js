const { allGames } = require('../../eleventy/lib/utils');
const { assetPath } = require('../../eleventy/lib/manifest');

module.exports = async function () {
	const games = await allGames();
	return {
		title: 'Game Count',
		description: 'Count of games played by day per team',
		islandScript: assetPath('src/client/game-count.ts'),
		gameCountData: {
			games,
		},
	};
};
