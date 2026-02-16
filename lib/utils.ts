import { SPORTS } from '@lib/constants';
import {
	allGamesDB,
	availableRankingsDB,
	availableTeamsDB,
	getRankedTeamsDB,
	getRankingDB,
	getTeamRankingsDB,
} from '@lib/dbFuncs';
import { AvailRanks, AvailTeams, Rank, RankingPathParams, Team, TeamGames, TeamPathParams, TeamRank } from '@lib/types';

const rankingsBySport: Record<string, AvailRanks> = {};
const rankingsExpireBySport: Record<string, number> = {};
export async function availableRankings(sport: string): Promise<AvailRanks> {
	const now: number = Math.floor(new Date().getTime() / 1000);
	if (!rankingsBySport[sport] || (rankingsExpireBySport[sport] || -1) < now) {
		const rankingObjects = await availableRankingsDB(sport);
		if (!rankingObjects.length) {
			throw new Error('Not found');
		}

		const rankings: AvailRanks = {};
		for (let i = 0; i < rankingObjects.length; i++) {
			const obj = rankingObjects[i];
			rankings[obj.year] = {
				weeks: obj.weeks,
				postseason: obj.postseason === 1 ? true : false,
			};
		}
		rankingsBySport[sport] = rankings;
		rankingsExpireBySport[sport] = now + 300;
	}

	return rankingsBySport[sport];
}

const teamInfoBySport: Record<string, AvailTeams> = {};
const teamInfoExpireBySport: Record<string, number> = {};
export async function availableTeams(sport: string): Promise<AvailTeams> {
	const now: number = Math.floor(new Date().getTime() / 1000);
	if (!teamInfoBySport[sport] || (teamInfoExpireBySport[sport] || -1) < now) {
		const teamInfoObjects = await availableTeamsDB(sport);
		if (!teamInfoObjects.length) {
			throw new Error('Not found');
		}

		const teamInfo: AvailTeams = {};
		for (let i = 0; i < teamInfoObjects.length; i++) {
			const obj = teamInfoObjects[i];
			teamInfo[obj.team_id.toString()] = {
				team_id: obj.team_id,
				name: obj.name,
				logo: obj.logo || '',
				logo_dark: obj.logo_dark || '',
			};
		}
		teamInfoBySport[sport] = teamInfo;
		teamInfoExpireBySport[sport] = now + 300;
	}

	return teamInfoBySport[sport];
}

export async function getRanking(sport: string, fbs: boolean, year: number, week: string): Promise<Rank[]> {
	const results = await getRankingDB(sport, fbs, year, week);
	const availTeams = await availableTeams(sport);

	const data: Rank[] = [];
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

export async function getTeamRankings(team: number): Promise<TeamRank[]> {
	const rankings = await getTeamRankingsDB('cfb', team);
	const teams = await availableTeams('cfb');

	const ranks: TeamRank[] = rankings.map((rank) => ({
		team: teams[rank.team_id.toString()],
		final_rank: rank.final_rank,
		year: rank.year,
		week: rank.week,
		postseason: rank.postseason,
	}));

	return ranks;
}

export async function getRankedTeams(): Promise<Team[]> {
	const rankedTeams = await getRankedTeamsDB('cfb');
	const allTeams = await availableTeams('cfb');

	const teams = rankedTeams.map((team) => allTeams[team.team_id.toString()]);

	return teams;
}

export async function allGames(): Promise<TeamGames[]> {
	const games = await allGamesDB('cfb');
	const teams = await availableTeams('cfb');

	const allGames: TeamGames[] = games
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

	return allGames;
}

export async function getRankingPathParams(): Promise<RankingPathParams[]> {
	const paths: RankingPathParams[] = [];
	for (const [sportKey, sportConfig] of Object.entries(SPORTS)) {
		const avail: AvailRanks = await availableRankings(sportConfig.dbSport);
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

export async function getTeamPathParams(): Promise<TeamPathParams[]> {
	const rankedTeams = await getRankedTeamsDB('cfb');
	const paths = rankedTeams.map((team) => ({
		params: {
			team: team.team_id.toString(),
		},
	}));

	return paths;
}
