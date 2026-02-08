const { getTeamRankings, buildTeamChartData } = require('../../eleventy/lib/utils');

module.exports = {
	pagination: {
		data: 'teamPaths',
		size: 1,
		alias: 'teamPath',
	},
	permalink: (data) => `/team/${data.teamPath.params.team}/`,
	eleventyComputed: {
		islandScript: () => '/assets/build/team.js',
		teamData: async (data) => {
			const teamId = Number(data.teamPath.params.team);
			const results = await getTeamRankings(teamId);
			if (!results.length) {
				return null;
			}
			const { data: rankList, years } = buildTeamChartData(results);
			return {
				team: results[0].team,
				rankList,
				years,
			};
		},
		title: (data) => (data.teamData ? data.teamData.team.name : 'Teams'),
		description: (data) => (data.teamData ? `${data.teamData.team.name} historical rankings.` : ''),
	},
};
