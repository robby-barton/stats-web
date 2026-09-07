const { CHART_MAX_Y, SPORTS } = require('./constants');
let db = require('./db.js');

function isAllYears() {
	return process.env.ELEVENTY_ALL_YEARS === '1' || process.env.ELEVENTY_ALL_YEARS === 'true';
}

// Build-scoped caches: each entry holds the PROMISE of the computed value so
// concurrent in-flight calls share one underlying fetch. Cleared by
// clearCaches() on the 'eleventy.before' event (see eleventy.config.cjs).
let rankingsBySport = {};
async function availableRankings(sport) {
	if (!rankingsBySport[sport]) {
		rankingsBySport[sport] = (async () => {
			const rankingObjects = await db.availableRankingsDB(sport);
			if (!rankingObjects.length) {
				throw new Error(`Not found: no rankings available for sport '${sport}'`);
			}

			const rankings = {};
			for (let i = 0; i < rankingObjects.length; i++) {
				const obj = rankingObjects[i];
				rankings[obj.year] = {
					weeks: obj.weeks,
					postseason: obj.postseason === 1,
				};
			}
			return rankings;
		})();
	}

	return rankingsBySport[sport];
}

let teamInfoBySport = {};
async function availableTeams(sport) {
	if (!teamInfoBySport[sport]) {
		teamInfoBySport[sport] = (async () => {
			const teamInfoObjects = await db.availableTeamsDB(sport);
			if (!teamInfoObjects.length) {
				throw new Error(`Not found: no teams available for sport '${sport}'`);
			}

			const teamInfo = {};
			for (let i = 0; i < teamInfoObjects.length; i++) {
				const obj = teamInfoObjects[i];
				teamInfo[obj.team_id.toString()] = {
					team_id: obj.team_id,
					name: obj.name,
					logo: obj.logo || '',
					logo_dark: obj.logo_dark || '',
				};
			}
			return teamInfo;
		})();
	}

	return teamInfoBySport[sport];
}

function buildRankingRecordMap(results, availTeams) {
	const byYear = {};
	for (let i = 0; i < results.length; i++) {
		const row = results[i];
		const yearKey = row.year.toString();
		const weekKey = row.postseason === 1 ? 'final' : row.week.toString();
		if (!byYear[yearKey]) {
			byYear[yearKey] = {};
		}
		if (!byYear[yearKey][weekKey]) {
			byYear[yearKey][weekKey] = [];
		}
		byYear[yearKey][weekKey].push({
			team: availTeams[row.team_id.toString()],
			final_rank: row.final_rank,
			conf: row.conf,
			record: row.ties === 0 ? row.wins + '-' + row.losses : row.wins + '-' + row.losses + '-' + row.ties,
			srs_rank: row.srs_rank,
			sos_rank: row.sos_rank,
			final_raw: row.final_raw,
		});
	}

	return byYear;
}

let rankingsByYearDivision = {};
let rankingsByDivision = {};
async function loadRankingsForYear(sport, fbs, year) {
	const key = `${sport}-${fbs}-${year}`;
	if (rankingsByYearDivision[key]) {
		return rankingsByYearDivision[key];
	}

	const divKey = `${sport}-${fbs}`;
	if (isAllYears()) {
		if (!rankingsByDivision[divKey]) {
			rankingsByDivision[divKey] = (async () => {
				const results = await db.getRankingsForDivisionDB(sport, fbs);
				const availTeams = await availableTeams(sport);
				return buildRankingRecordMap(results, availTeams);
			})();
		}
		const byYear = await rankingsByDivision[divKey];
		return byYear[year.toString()] || {};
	}

	rankingsByYearDivision[key] = (async () => {
		const results = await db.getRankingsForYearDB(sport, fbs, year);
		const availTeams = await availableTeams(sport);
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
				record: row.ties === 0 ? row.wins + '-' + row.losses : row.wins + '-' + row.losses + '-' + row.ties,
				srs_rank: row.srs_rank,
				sos_rank: row.sos_rank,
				final_raw: row.final_raw,
			});
		}

		return byWeek;
	})();
	return rankingsByYearDivision[key];
}

async function getRanking(sport, fbs, year, week) {
	const byWeek = await loadRankingsForYear(sport, fbs, year);
	const weekKey = week.toLowerCase();
	return byWeek[weekKey] || [];
}

let teamRankingsBySport = {};
async function loadTeamRankings(sport) {
	if (!teamRankingsBySport[sport]) {
		teamRankingsBySport[sport] = (async () => {
			const results = await db.getAllTeamRankingsDB(sport);
			const teams = await availableTeams(sport);
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

			return byTeam;
		})();
	}

	return teamRankingsBySport[sport];
}

async function getTeamRankings(sport, team) {
	const byTeam = await loadTeamRankings(sport);
	return byTeam[team] || [];
}

async function getRankedTeams(sport) {
	const byTeam = await loadTeamRankings(sport);
	const allTeams = await availableTeams(sport);
	return Object.keys(byTeam)
		.map((teamId) => allTeams[teamId])
		.filter(Boolean);
}

async function allGames() {
	const games = await db.allGamesDB('ncaaf');
	const teams = await availableTeams('ncaaf');

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
	const paths = [];
	for (const [sportKey, sportConfig] of Object.entries(SPORTS)) {
		const avail = await availableRankings(sportConfig.dbSport);
		for (const division of sportConfig.divisions) {
			for (const [year, value] of Object.entries(avail)) {
				const { weeks, postseason } = value;
				for (let i = 1; i <= weeks; i++) {
					paths.push({
						params: {
							sport: sportKey,
							division: division,
							year: year,
							week: i.toString(),
						},
					});
				}
				if (postseason) {
					paths.push({
						params: { sport: sportKey, division: division, year: year, week: 'final' },
					});
				}
			}
		}
	}

	return paths;
}

async function getTeamPathParams() {
	const teamIds = new Set();
	for (const sportConfig of Object.values(SPORTS)) {
		const byTeam = await loadTeamRankings(sportConfig.dbSport);
		for (const teamId of Object.keys(byTeam)) {
			teamIds.add(teamId.toString());
		}
	}

	return Array.from(teamIds).map((teamId) => ({
		params: {
			team: teamId,
		},
	}));
}

function buildTeamChartData(results) {
	const data = [];
	const years = [];
	let maxRank = 0;

	for (let i = 0; i < results.length; i++) {
		const rank = results[i].final_rank;
		if (rank > maxRank) {
			maxRank = rank;
		}
		data.push({
			week: `${results[i].year} Week ${results[i].postseason ? 'Final' : results[i].week}`,
			rank,
			fillLevel: CHART_MAX_Y,
		});
		if (!years.includes(results[i].year)) {
			years.push(results[i].year);
		}
	}

	const chartMaxY = Math.max(CHART_MAX_Y, Math.ceil(maxRank / 50) * 50);

	return { data, years, chartMaxY };
}

function clearCaches() {
	rankingsBySport = {};
	teamInfoBySport = {};
	rankingsByYearDivision = {};
	rankingsByDivision = {};
	teamRankingsBySport = {};
}

function setDb(mockDb) {
	db = mockDb;
	clearCaches();
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
	setDb,
	clearCaches,
};
