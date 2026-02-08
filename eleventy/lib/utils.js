const { DIVISIONS, CHART_MAX_Y } = require('./constants');
const {
	allGamesDB,
	availableRankingsDB,
	availableTeamsDB,
	getRankedTeamsDB,
	getRankingDB,
	getTeamRankingsDB,
} = require('./db');

let rankings = {};
let rankingsExpire = -1;
async function availableRankings() {
	const now = Math.floor(new Date().getTime() / 1000);
	if (!rankings || rankingsExpire < now) {
		const rankingObjects = await availableRankingsDB();
		if (!rankingObjects.length) {
			throw new Error('Not found');
		}

		rankings = {};
		for (let i = 0; i < rankingObjects.length; i++) {
			const obj = rankingObjects[i];
			rankings[obj.year] = {
				weeks: obj.weeks,
				postseason: obj.postseason === 1,
			};
		}
		rankingsExpire = now + 300;
	}

	return rankings;
}

let teamInfo = {};
let teamInfoExpire = -1;
async function availableTeams() {
	const now = Math.floor(new Date().getTime() / 1000);
	if (!teamInfo || teamInfoExpire < now) {
		const teamInfoObjects = await availableTeamsDB();
		if (!teamInfoObjects.length) {
			throw new Error('Not found');
		}

		teamInfo = {};
		for (let i = 0; i < teamInfoObjects.length; i++) {
			const obj = teamInfoObjects[i];
			teamInfo[obj.team_id.toString()] = {
				team_id: obj.team_id,
				name: obj.name,
				logo: obj.logo || '',
				logo_dark: obj.logo_dark || '',
			};
		}
		teamInfoExpire = now + 300;
	}

	return teamInfo;
}

async function getRanking(fbs, year, week) {
	const results = await getRankingDB(fbs, year, week);
	const availTeams = await availableTeams();

	const data = [];
	for (let i = 0; i < results.length; i++) {
		data.push({
			team: availTeams[results[i].team_id.toString()],
			final_rank: results[i].final_rank,
			conf: results[i].conf,
			record:
				results[i].ties === 0
					? results[i].wins + '-' + results[i].losses
					: results[i].wins + '-' + results[i].losses + '-' + results[i].ties,
			srs_rank: results[i].srs_rank,
			sos_rank: results[i].sos_rank,
			final_raw: results[i].final_raw,
		});
	}

	return data;
}

async function getTeamRankings(team) {
	const rankings = await getTeamRankingsDB(team);
	const teams = await availableTeams();

	const ranks = rankings.map((rank) => ({
		team: teams[rank.team_id.toString()],
		final_rank: rank.final_rank,
		year: rank.year,
		week: rank.week,
		postseason: rank.postseason,
	}));

	return ranks;
}

async function getRankedTeams() {
	const rankedTeams = await getRankedTeamsDB();
	const allTeams = await availableTeams();

	const teams = rankedTeams.map((team) => allTeams[team.team_id.toString()]);

	return teams;
}

async function allGames() {
	const games = await allGamesDB();
	const teams = await availableTeams();

	const allGamesList = games
		.filter((gameSet) => {
			return teams[gameSet.team_id.toString()] ? true : false;
		})
		.map((gameSet) => ({
			team: teams[gameSet.team_id.toString()],
			sun: gameSet.sun,
			mon: gameSet.mon,
			tue: gameSet.tue,
			wed: gameSet.wed,
			thu: gameSet.thu,
			fri: gameSet.fri,
			sat: gameSet.sat,
			total: gameSet.total,
		}));

	return allGamesList;
}

async function getRankingPathParams() {
	const avail = await availableRankings();
	const paths = [];
	DIVISIONS.map((division) =>
		Object.entries(avail).forEach((entry) => {
			const [year, value] = entry;
			const { weeks, postseason } = value;
			for (let i = 1; i <= weeks; i++) {
				paths.push({
					params: {
						division: division,
						year: year,
						week: i.toString(),
					},
				});
			}
			if (postseason) {
				paths.push({
					params: { division: division, year: year, week: 'final' },
				});
			}
		}),
	);

	return paths;
}

async function getTeamPathParams() {
	const rankedTeams = await getRankedTeamsDB();
	const paths = rankedTeams.map((team) => ({
		params: {
			team: team.team_id.toString(),
		},
	}));

	return paths;
}

function buildTeamChartData(results) {
	const data = [];
	const years = [];

	for (let i = 0; i < results.length; i++) {
		data.push({
			week: `${results[i].year} Week ${results[i].postseason ? 'Final' : results[i].week}`,
			rank: results[i].final_rank,
			fillLevel: CHART_MAX_Y,
		});
		if (!years.includes(results[i].year)) {
			years.push(results[i].year);
		}
	}

	return { data, years };
}

module.exports = {
	availableRankings,
	availableTeams,
	getRanking,
	getTeamRankings,
	getRankedTeams,
	allGames,
	getRankingPathParams,
	getTeamPathParams,
	buildTeamChartData,
};
