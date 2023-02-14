import prisma from './prisma';

// need to tell it how to handle BigInts from Postgres
BigInt.prototype.toJSON = function () {
  return Number(this)
}

export function makeSerializable (o) {
  return JSON.parse(JSON.stringify(o))
}

let rankings = null
let rankingsExpire = null
export async function availableRankings() {
  let now = Math.floor(new Date().getTime() / 1000)
  if (!rankings || rankingsExpire < now) {
    const rankingObjects = await prisma.$queryRaw`
      select year, max(case when postseason = 0 then week else 0 end) as week,
      max(postseason) as postseason from team_week_results
      group by year order by year desc`
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

const divisions = ['fbs', 'fcs']
export async function checkRanking(division, year, week) {
  const avail = await availableRankings()
  if (divisions.includes(division.toLowerCase()) && year in avail) {
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

  const results = await prisma.team_week_results.findMany({
    where: opts,
    orderBy: [
      {
        final_rank: 'asc',
      },
    ],
  })

  return results
}

export async function getTeamRankings(team) {
  const results = await prisma.team_week_results.findMany({
    select: {
      team_id: true,
      name: true,
      final_rank: true,
      year: true,
      week: true,
    },
    where: {
      team_id: Number(team),
    },
    orderBy: [
      {
        year: 'asc',
      },
      {
        postseason: 'asc',
      },
      {
        week: 'asc',
      },
    ],
  })

  return results
}

export async function getUniqueTeams() {
  const results = await prisma.$queryRaw`
    select team_id, name from team_names where team_id in
    (select distinct team_id from team_week_results)
    order by name`
  return results
}

export async function allGames() {
  const results = await prisma.$queryRaw`
    select
      n.name,
      g.*
    from (
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
      from (
        select home_id as team_id, extract(dow from start_time) as dow, game_id from games union 
        select away_id as team_id, extract(dow from start_time) as dow, game_id from games
      ) as gTemp group by team_id
    ) as g join team_names n on (g.team_id = n.team_id) order by total desc
  `

  return results
}
