import Layout from '../../../../components/layout';
import Title from '../../../../components/title';
import Header from '../../../../components/header';
import Meta from '../../../../components/meta';
import Ranking from '../../../../components/ranking';
import { availableRankings, getRanking } from '../../../../lib/utils';

export default function Week({ rankList, results, division, year, week }) {
  let weekTitle = 'Week ' + week
  if (week === 'Final') {
    weekTitle = 'Final'
  }
  const title = [division, year, weekTitle].join(' ')
  const meta = `${weekTitle} computer rankings for the ${year} ${division} college football season.`

  return (
    <Layout>
      <Title title={title} />
      <Meta desc={meta} />
      <Ranking 
        rankList={rankList}
        teamList={results}
        division={division}
        year={year}
        week={week}
      />
    </Layout>
  )
}

const divisions = ['fbs', 'fcs']
export async function getStaticProps({ params }) {
  const { division, year, week } = params

  const avail = await availableRankings()
  if (!divisions.includes(division.toLowerCase()) || !(year in avail)) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    }
  } else if (week.toLowerCase() === 'final' && !avail[year].postseason) {
    return {
      redirect: {
        permanent: false,
        destination: `/ranking/${division}/${year}/${avail[year].weeks}`
      },
      props: {},
    }
  } else if (week.toLowerCase() !== 'final' && isNaN(week)) {
    return {
      redirect: {
        permanent: false,
        destination: `/ranking/${division}/${year}/${avail[year].postseason ? 'final' : avail[year].weeks}`
      },
      props: {},
    }
  } else if (week > avail[year].weeks) {
    return {
      redirect: {
        permanent: false,
        destination: `/ranking/${division}/${year}/${avail[year].postseason ? 'final' : avail[year].weeks}`
      },
      props: {},
    }
  } else if (week < 1) {
    return {
      redirect: {
        permanent: false,
        destination: `/ranking/${division}/${year}/1`
      },
      props: {},
    }
  }

  const results = await getRanking(division.toLowerCase() === 'fbs' ? true : false, year, week)

  return {
    props: {
      rankList: avail,
      division: division.toUpperCase(),
      year: year,
      week: week.toLowerCase() === 'final' ? 'Final' : week,
      results: results,
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  const avail = await availableRankings()
  const paths = []
  divisions.map(division => (
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
  return {
    paths: paths,
    fallback: 'blocking',
  }
}
