const postgres = require('postgres');

require('dotenv').config();

function getDatabaseUrl() {
	return process.env.DATABASE_URL || process.env.DEV_DATABASE_URL;
}

const sql = postgres(getDatabaseUrl(), {
	idle_timeout: 20,
	max_lifetime: 60 * 30,
	prepare: false,
});

async function availableRankingsDB() {
	const rankingObjects = await sql`
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

async function availableTeamsDB() {
	const results = await sql`
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

async function getRankingDB(fbs, year, week) {
	const isFinal = week.toLowerCase() === 'final';
	const results = await sql`
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
			${isFinal ? sql`postseason = 1` : sql`week = ${week} and postseason = 0`}
		order by
			final_rank
	`;

	return results;
}

async function getTeamRankingsDB(team) {
	const results = await sql`
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

async function getRankedTeamsDB() {
	const results = await sql`
		select
			distinct team_id
		from team_week_results
	`;

	return results;
}

async function allGamesDB() {
	const results = await sql`
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

module.exports = {
	availableRankingsDB,
	availableTeamsDB,
	getRankingDB,
	getTeamRankingsDB,
	getRankedTeamsDB,
	allGamesDB,
};
