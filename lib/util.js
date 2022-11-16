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
      select year, max(week) as week, max(postseason) as postseason from team_week_results 
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
    if (year.toLowerCase() === 'final' && avail[year].postseason) {
      return true
    } else if (Number.isFinite(week) && week > 0 && week <= avail[year].week) {
      return true
    }
  }

  return false
}
