import { DIVISIONS } from "@lib/constants";
import { allGamesDB, availableRankingsDB, getRankingDB, getTeamRankingsDB, getUniqueTeamsDB } from "@lib/dbFuncs";
import { AvailRanks, Rank, RankingPathParams, Team, TeamGames, TeamPathParams, TeamRank } from "@lib/types";

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

export async function getRanking(fbs: boolean, year: number, week: string): Promise<Rank[]> {
	const results = await getRankingDB(fbs, year, week);

	const data: Rank[] = [];
	for (let i = 0; i < results.length; i++) {
		data.push({
			team_id: results[i].team_id,
			final_rank: results[i].final_rank,
			name: results[i].name,
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
	return await getTeamRankingsDB(team);
}

export async function getUniqueTeams(): Promise<Team[]> {
	return await getUniqueTeamsDB();
}

export async function allGames(): Promise<TeamGames[]> {
	return await allGamesDB();
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
	const results: Team[] = await getUniqueTeams();
	const paths = results.map((team) => ({
		params: { team: team.team_id.toString() },
	}));

	return paths;
}
