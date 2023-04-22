import sql from './db';
import { DIVISIONS } from './constants';

// need to tell it how to handle BigInts from Postgres
BigInt.prototype.toJSON = function () {
  return Number(this)
}

let rankings = null
let rankingsExpire = null
export async function availableRankings() {
  let now = Math.floor(new Date().getTime() / 1000)
  if (!rankings || rankingsExpire < now) {
    const rankingObjects = await sql`
      select 
        year, 
        max(case when postseason = 0 then week else 0 end) as week,
        max(postseason) as postseason 
      from team_week_results
      group by 
        year 
      order by 
        year desc
    `
    console.log("re-pull rankings per year")
    rankings = {}
    for (let i = 0; i < rankingObjects.length; i++) {
      const obj = rankingObjects[i]
      rankings[obj.year] = {
        weeks: obj.week,
        postseason: obj.postseason === 1 ? true : false,
      }
    }
    rankingsExpire = now + 300 // refresh every 5 minutes
  }

  return rankings
}

export async function checkRanking(division, year, week) {
  const avail = await availableRankings()
  if (DIVISIONS.includes(division.toLowerCase()) && year in avail) {
    if (week.toLowerCase() === 'final' && avail[year].postseason) {
      return true
    }
    if (week > 0 && week <= avail[year].weeks) {
      return true
    }
  }

  return false
}

export async function getRanking(fbs, year, week) {
  const opts = {
    year: Number(year),
    fbs: fbs,
  }
  if (week.toLowerCase() === "final") {
    opts.postseason = Number(1)
  } else {
    opts.postseason = Number(0)
    opts.week = Number(week)
  }

  const results = await sql`
    select 
      *
    from team_week_results
    where
      fbs = ${fbs} and
      year = ${year} and
      ${
        week.toLowerCase() === "final"
          ? sql`postseason = 1`
          : sql`week = ${week} and postseason = 0`
      }
    order by
      final_rank
  `

  return results
}

export async function getTeamRankings(team) {
  const results = await sql`
    select
      team_id,
      name,
      final_rank,
      year,
      week
    from team_week_results
    where
      team_id = ${team}
    order by
      year,
      postseason,
      week
  `
  return results
}

export async function getUniqueTeams() {
  const results = await sql`
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
  `
  return results
}

export async function allGames() {
  const results = await sql`
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
  `

  return results
}

export async function getRankingPathParams() {
  const avail = await availableRankings()
  const paths = []
  DIVISIONS.map(division => (
    Object.entries(avail).forEach(entry => {
      const [ year, value ] = entry
      const { weeks, postseason } = value
      for (let i = 1; i <= weeks; i++) {
        paths.push({params: { division: division, year: year.toString(), week: i.toString() }})
      }
      if (postseason) {
        paths.push({params: { division: division, year: year.toString(), week: 'final' }})
      }
    })
  ))

  return paths
}

export async function getTeamPathParams() {
  const results = await getUniqueTeams()
  const paths = results.map(team => ({ params: { team: team.team_id.toString() }}))

  return paths
}
