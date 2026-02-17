const { SPORTS } = require('../../eleventy/lib/constants');
const { getTeamRankings, buildTeamChartData } = require('../../eleventy/lib/utils');

module.exports = {
	pagination: {
		data: 'teamPaths',
		size: 1,
		alias: 'teamPath',
	},
	permalink: (data) => `/team/${data.teamPath.params.team}/`,
	eleventyComputed: {
		islandScript: (data) => `/assets/build/${data.viteManifest['src/client/team.ts'].file}`,
		teamData: async (data) => {
			const teamId = Number(data.teamPath.params.team);
			const sports = {};
			let team = null;

			for (const [sportKey, sportConfig] of Object.entries(SPORTS)) {
				const results = await getTeamRankings(sportConfig.dbSport, teamId);
				if (!results.length) {
					continue;
				}
				if (!team) {
					team = results[0].team;
				}
				const { data: rankList, years, chartMaxY } = buildTeamChartData(results);
				sports[sportKey] = { rankList, years, chartMaxY };
			}

			if (!team) {
				return null;
			}

			return { team, sports };
		},
		title: (data) => (data.teamData ? data.teamData.team.name : 'Teams'),
		description: (data) => (data.teamData ? `${data.teamData.team.name} historical rankings.` : ''),
	},
};
