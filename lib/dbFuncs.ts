/* istanbul ignore file */

import postgres from 'postgres';

import { Team } from '@lib/types';

function getDatabaseUrl(): string {
	return process.env.DATABASE_URL || process.env.DEV_DATABASE_URL;
}

const sql = postgres(getDatabaseUrl(), {
	idle_timeout: 20,
	max_lifetime: 60 * 30,
	prepare: false,
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

export async function availableTeamsDB(): Promise<Team[]> {
	const results: Team[] = await sql<Team[]>`
		select
			team_id,
			name,
			logo,
			logo_dark
		from team_names
		order by
			name
	`;

	return results;
}

type SQLRank = {
	team_id: number;
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
			${week.toLowerCase() === 'final' ? sql`postseason = 1` : sql`week = ${week} and postseason = 0`}
		order by
			final_rank
	`;

	return results;
}

type SQLTeamRank = {
	team_id: number;
	final_rank: number;
	year: number;
	week: string;
	postseason: number;
};
export async function getTeamRankingsDB(team: number): Promise<SQLTeamRank[]> {
	const results: SQLTeamRank[] = await sql<SQLTeamRank[]>`
		select
			team_id,
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

type SQLRankedTeam = {
	team_id: number;
};
export async function getRankedTeamsDB(): Promise<SQLRankedTeam[]> {
	const results: SQLRankedTeam[] = await sql<SQLRankedTeam[]>`
		select
			distinct team_id
		from team_week_results
	`;

	return results;
}

type SQLTeamGames = {
	team_id: number;
	sun: number;
	mon: number;
	tue: number;
	wed: number;
	thu: number;
	fri: number;
	sat: number;
	total: number;
};
export async function allGamesDB(): Promise<SQLTeamGames[]> {
	const results: SQLTeamGames[] = await sql<SQLTeamGames[]>`
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
		order by
			total desc
	`;

	return results;
}
