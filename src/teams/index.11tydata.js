const { getRankedTeams } = require('../../eleventy/lib/utils');

module.exports = async function () {
	const teams = await getRankedTeams('cfb');
	teams.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));

	return {
		title: 'Teams',
		description: 'Teams included in one or more rankings',
		islandScript: '/assets/build/teams.js',
		teamsData: {
			teams,
		},
	};
};
