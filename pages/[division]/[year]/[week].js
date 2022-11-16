import Head from 'next/head';
import Layout from '../../../components/layout';
import Title from '../../../components/title';
import ResultTable from '../../../components/resultTable';
import Error from 'next/error';
import utilStyles from '../../../styles/utils.module.css';
import { availableRankings, checkRanking, getRanking } from '../../../lib/util';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Week({ rankList, results, division, year, week }) {
  if (!results) {
    const router = useRouter();
    useEffect(() => {
      router.push('/')
    }, [])
    return null;
  }

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

export async function getServerSideProps({ params, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  const { division, year, week } = params

  if (!await checkRanking(division, year, week)) {
    return {
      props: {
        results: null,
      }
    }
  }

  const results = await getRanking(division.toLowerCase() === 'fbs' ? true : false, year, week)

  const avail = await availableRankings()
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
