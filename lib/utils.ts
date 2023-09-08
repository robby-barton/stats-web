import { DIVISIONS } from "@lib/constants";
import {
	allGamesDB,
	availableRankingsDB,
	availableTeamsDB,
	getRankedTeamsDB,
	getRankingDB,
	getTeamRankingsDB,
} from "@lib/dbFuncs";
import { AvailRanks, AvailTeams, Rank, RankingPathParams, Team, TeamGames, TeamPathParams, TeamRank } from "@lib/types";

let rankings: AvailRanks = {};
let rankingsExpire = -1;
export async function availableRankings(): Promise<AvailRanks> {
	const now: number = Math.floor(new Date().getTime() / 1000);
	if (!rankings || rankingsExpire < now) {
		const rankingObjects = await availableRankingsDB();
		if (!rankingObjects.length) {
			throw new Error("Not found");
		}

		rankings = {};
		for (let i = 0; i < rankingObjects.length; i++) {
			const obj = rankingObjects[i];
			rankings[obj.year] = {
				weeks: obj.weeks,
				postseason: obj.postseason === 1 ? true : false,
			};
		}
		rankingsExpire = now + 300; // refresh every 5 minutes
	}

	return rankings;
}

let teamInfo: AvailTeams = {};
let teamInfoExpire = -1;
export async function availableTeams(): Promise<AvailTeams> {
	const now: number = Math.floor(new Date().getTime() / 1000);
	if (!teamInfo || teamInfoExpire < now) {
		const teamInfoObjects = await availableTeamsDB();
		if (!teamInfoObjects.length) {
			throw new Error("Not found");
		}

		teamInfo = {};
		for (let i = 0; i < teamInfoObjects.length; i++) {
			const obj = teamInfoObjects[i];
			teamInfo[obj.team_id.toString()] = {
				team_id: obj.team_id,
				name: obj.name,
				logo: obj.logo || "",
				logo_dark: obj.logo_dark || "",
			};
		}
		teamInfoExpire = now + 300; // refresh every 5 minutes
	}

	return teamInfo;
}

export async function getRanking(fbs: boolean, year: number, week: string): Promise<Rank[]> {
	const results = await getRankingDB(fbs, year, week);
	const availTeams = await availableTeams();

	const data: Rank[] = [];
	for (let i = 0; i < results.length; i++) {
		data.push({
			team: availTeams[results[i].team_id.toString()],
			final_rank: results[i].final_rank,
			conf: results[i].conf,
			record:
				results[i].ties === 0
					? results[i].wins + "-" + results[i].losses
					: results[i].wins + "-" + results[i].losses + "-" + results[i].ties,
			srs_rank: results[i].srs_rank,
			sos_rank: results[i].sos_rank,
			final_raw: results[i].final_raw,
		});
	}

	return data;
}

export async function getTeamRankings(team: number): Promise<TeamRank[]> {
	const rankings = await getTeamRankingsDB(team);
	const teams = await availableTeams();

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
	const rankedTeams = await getRankedTeamsDB();
	const allTeams = await availableTeams();

	const teams = rankedTeams.map((team) => allTeams[team.team_id.toString()]);

	return teams;
}

export async function allGames(): Promise<TeamGames[]> {
	const games = await allGamesDB();
	const teams = await availableTeams();

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
	const avail: AvailRanks = await availableRankings();
	const paths: RankingPathParams[] = [];
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
					params: { division: division, year: year, week: "final" },
				});
			}
		})
	);

	return paths;
}

export async function getTeamPathParams(): Promise<TeamPathParams[]> {
	const rankedTeams = await getRankedTeamsDB();
	const paths = rankedTeams.map((team) => ({
		params: {
			team: team.team_id.toString(),
		},
	}));

	return paths;
}
