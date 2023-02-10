import prisma from './prisma';

export function makeSerializable (o) {
  return JSON.parse(JSON.stringify(o))
}

var rankings = null
var rankingsExpire = null
export async function availableRankings() {
  let now = Math.floor(new Date().getTime() / 1000)
  if (!rankings || rankingsExpire < now) {
    const rankingObjects = await prisma.$queryRaw`
      select year, max(case when postseason = 0 then week else 0 end) as week,
      max(postseason) as postseason from team_week_results
      group by year order by year desc`
    console.log("re-pull rankings per year")
    rankings = {}
    for (var i = 0; i < rankingObjects.length; i++) {
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
  const results = await prisma.team_week_results.findMany({
    distinct: ['name', 'team_id'],
    orderBy: {
      name: 'asc',
    },
    select: {
      name: true,
      team_id: true,
    },
  })
  return results
}
