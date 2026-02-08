const { DIVISIONS, CHART_MAX_Y } = require('./constants');
const {
	allGamesDB,
	availableRankingsDB,
	availableTeamsDB,
	getAllTeamRankingsDB,
	getRankingsForYearDB,
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

let rankingsByYearDivision = {};
async function loadRankingsForYear(fbs, year) {
	const key = `${fbs}-${year}`;
	if (rankingsByYearDivision[key]) {
		return rankingsByYearDivision[key];
	}

	const results = await getRankingsForYearDB(fbs, year);
	const availTeams = await availableTeams();
	const byWeek = {};

	for (let i = 0; i < results.length; i++) {
		const row = results[i];
		const weekKey = row.postseason === 1 ? 'final' : row.week.toString();
		if (!byWeek[weekKey]) {
			byWeek[weekKey] = [];
		}
		byWeek[weekKey].push({
			team: availTeams[row.team_id.toString()],
			final_rank: row.final_rank,
			conf: row.conf,
			record:
				row.ties === 0 ? row.wins + '-' + row.losses : row.wins + '-' + row.losses + '-' + row.ties,
			srs_rank: row.srs_rank,
			sos_rank: row.sos_rank,
			final_raw: row.final_raw,
		});
	}

	rankingsByYearDivision[key] = byWeek;
	return byWeek;
}

async function getRanking(fbs, year, week) {
	const byWeek = await loadRankingsForYear(fbs, year);
	const weekKey = week.toLowerCase();
	return byWeek[weekKey] || [];
}

let teamRankingsByTeam = null;
async function loadTeamRankings() {
	if (teamRankingsByTeam) {
		return teamRankingsByTeam;
	}

	const results = await getAllTeamRankingsDB();
	const teams = await availableTeams();
	const byTeam = {};

	for (let i = 0; i < results.length; i++) {
		const row = results[i];
		const team = teams[row.team_id.toString()];
		if (!team) {
			continue;
		}
		if (!byTeam[row.team_id]) {
			byTeam[row.team_id] = [];
		}
		byTeam[row.team_id].push({
			team,
			final_rank: row.final_rank,
			year: row.year,
			week: row.week,
			postseason: row.postseason,
		});
	}

	teamRankingsByTeam = byTeam;
	return byTeam;
}

async function getTeamRankings(team) {
	const byTeam = await loadTeamRankings();
	return byTeam[team] || [];
}

async function getRankedTeams() {
	const byTeam = await loadTeamRankings();
	const allTeams = await availableTeams();
	return Object.keys(byTeam)
		.map((teamId) => allTeams[teamId])
		.filter(Boolean);
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
	const byTeam = await loadTeamRankings();
	const paths = Object.keys(byTeam).map((teamId) => ({
		params: {
			team: teamId.toString(),
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
