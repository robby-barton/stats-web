/* istanbul ignore file */

import postgres from "postgres";

import { Team, TeamGames, TeamRank } from "@lib/types";

function getDatabaseUrl(): string {
	return process.env.DATABASE_URL;
}

const sql = postgres(getDatabaseUrl(), {
	idle_timeout: 20,
	max_lifetime: 60 * 30,
});

type SQLYearWeeks = {
	year: string;
	weeks: number;
	postseason: number;
};
export async function availableRankingsDB(): Promise<SQLYearWeeks[]> {
	const rankingObjects: SQLYearWeeks[] = await sql<SQLYearWeeks[]>`
			select 
				year, 
				max(case when postseason = 0 then week else 0 end) as weeks,
				max(postseason) as postseason 
			from team_week_results
			group by 
				year 
			order by 
				year desc
		`;

	return rankingObjects;
}

type SQLRank = {
	team_id: number;
	name: string;
	conf: string;
	final_rank: number;
	final_raw: number;
	wins: number;
	losses: number;
	ties: number;
	sos_rank: number;
	srs_rank: number;
};
export async function getRankingDB(fbs: boolean, year: number, week: string): Promise<SQLRank[]> {
	const results = await sql<SQLRank[]>`
		select 
			team_id,
			name,
			conf,
			final_rank,
			final_raw,
			wins,
			losses,
			ties,
			sos_rank,
			srs_rank
		from team_week_results
		where
			fbs = ${fbs} and
			year = ${year} and
			${week.toLowerCase() === "final" ? sql`postseason = 1` : sql`week = ${week} and postseason = 0`}
		order by
			final_rank
	`;

	return results;
}

export async function getTeamRankingsDB(team: number): Promise<TeamRank[]> {
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

export async function getUniqueTeamsDB(): Promise<Team[]> {
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

export async function allGamesDB(): Promise<TeamGames[]> {
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
