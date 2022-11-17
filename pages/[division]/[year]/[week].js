import Head from 'next/head';
import Layout from '../../../components/layout';
import Title from '../../../components/title';
import ResultTable from '../../../components/resultTable';
import Error from 'next/error';
import utilStyles from '../../../styles/utils.module.css';
import { availableRankings, getRanking } from '../../../lib/util';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Week({ rankList, results, division, year, week }) {
  var weekTitle = 'Week ' + week
  if (week === 'Final') {
    weekTitle = 'Final'
  }
  const title = [division, year, weekTitle].join(' ')

  return (
    <Layout>
      <Title title={title} />
      <section className={utilStyles.headingXl}>
        <p>{title}</p>
      </section>
      <ResultTable 
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
export async function getServerSideProps({ params, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

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
        destination: `/${division}/${year}/${avail[year].weeks}`
      },
      props: {},
    }
  } else if (week.toLowerCase() !== 'final' && isNaN(week)) {
    return {
      redirect: {
        permanent: false,
        destination: `/${division}/${year}/${avail[year].postseason ? 'final' : avail[year].weeks}`
      },
      props: {},
    }
  } else if (week > avail[year].weeks) {
    return {
      redirect: {
        permanent: false,
        destination: `/${division}/${year}/${avail[year].postseason ? 'final' : avail[year].weeks}`
      },
      props: {},
    }
  } else if (week < 1) {
    return {
      redirect: {
        permanent: false,
        destination: `/${division}/${year}/1`
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
    }
  }
}
