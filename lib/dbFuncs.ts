import { DIVISIONS } from "@lib/constants";
import sql from "@lib/db";
import { AvailRanks, Rank, RankingPathParams, Team, TeamGames, TeamPathParams, TeamRank } from "@lib/types";

let rankings: AvailRanks = {};
let rankingsExpire = -1;

type SQLYearRanks = {
	year: string;
	week: number;
	postseason: number;
};
export async function availableRankings(): Promise<AvailRanks> {
	const now: number = Math.floor(new Date().getTime() / 1000);
	if (!rankings || rankingsExpire < now) {
		const rankingObjects: SQLYearRanks[] = await sql<SQLYearRanks[]>`
			select 
				year, 
				max(case when postseason = 0 then week else 0 end) as week,
				max(postseason) as postseason 
			from team_week_results
			group by 
				year 
			order by 
				year desc
		`;
		if (!rankingObjects.length) {
			throw new Error("Not found");
		}

		rankings = {};
		for (let i = 0; i < rankingObjects.length; i++) {
			const obj: SQLYearRanks = rankingObjects[i];
			rankings[obj.year] = {
				weeks: obj.week,
				postseason: obj.postseason === 1 ? true : false,
			};
		}
		rankingsExpire = now + 300; // refresh every 5 minutes
	}

	return rankings;
}

export async function checkRanking(division: string, year: number, week: string): Promise<boolean> {
	const avail: AvailRanks = await availableRankings();
	if (DIVISIONS.includes(division.toLowerCase()) && year in avail) {
		if (week.toLowerCase() === "final" && avail[year].postseason) {
			return true;
		}
		if (Number(week) > 0 && Number(week) <= avail[year].weeks) {
			return true;
		}
	}

	return false;
}

export async function getRanking(fbs: boolean, year: number, week: string): Promise<Rank[]> {
	const results = await sql`
		select 
			*
		from team_week_results
		where
			fbs = ${fbs} and
			year = ${year} and
			${week.toLowerCase() === "final" ? sql`postseason = 1` : sql`week = ${week} and postseason = 0`}
		order by
			final_rank
	`;

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
	const results: TeamRank[] = await sql<TeamRank[]>`
		select
			team_id,
			name,
			final_rank,
			year,
			week,
			postseason
		from team_week_results
		where
			team_id = ${team}
		order by
			year,
			postseason,
			week
	`;

	return results;
}

export async function getUniqueTeams(): Promise<Team[]> {
	const results: Team[] = await sql<Team[]>`
		select 
			team_id, 
			name 
		from team_names 
		where 
			team_id in (
				select 
				distinct team_id 
				from team_week_results
			)
		order by 
			name
	`;
	if (!results.length) {
		throw new Error("Not found");
	}

	return results;
}

export async function allGames(): Promise<TeamGames[]> {
	const results: TeamGames[] = await sql<TeamGames[]>`
		with gamesDOW as (
			with gamesList as (
				(
					select
						home_id as team_id,
						extract(dow from start_time) as dow,
						game_id
					from games
				) union all (
					select
						away_id as team_id,
						extract(dow from start_time) as dow,
						game_id
					from games
				)
			)
			select
				team_id,
				sum(case when dow = 0 then 1 else 0 end) as sun,
				sum(case when dow = 1 then 1 else 0 end) as mon,
				sum(case when dow = 2 then 1 else 0 end) as tue,
				sum(case when dow = 3 then 1 else 0 end) as wed,
				sum(case when dow = 4 then 1 else 0 end) as thu,
				sum(case when dow = 5 then 1 else 0 end) as fri,
				sum(case when dow = 6 then 1 else 0 end) as sat,
				count(1) as total
			from gamesList
			group by
				team_id
		)
		select
			n.name,
			g.*
		from team_names n
		join gamesDOW g on (n.team_id = g.team_id)
		order by
			total desc
	`;

	return results;
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
