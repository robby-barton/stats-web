import Head from 'next/head';
import Layout from '../../../components/layout';
import Title from '../../../components/title';
import ResultTable from '../../../components/resultTable';
import Error from 'next/error';
import utilStyles from '../../../styles/utils.module.css';
import { checkRanking, getRanking } from '../../../lib/util';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Week = props => {
  if (!props.results) {
    const router = useRouter();
    useEffect(() => {
      router.push('/')
    }, [])
    return null;
  }

  var week = 'Week ' + props.week
  if (props.week === 'Final') {
    week = 'Final'
  }
  const title = [props.division, props.year, week].join(' ')

  return (
    <Layout>
      <Title title={title} />
      <section className={utilStyles.headingXl}>
        <div>{title}</div>
      </section>
      <ResultTable teamList={props.results} />
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

  return {
    props: {
      division: division.toUpperCase(),
      year: year,
      week: week.toLowerCase() === 'final' ? 'Final' : week,
      results: results,
    }
  }
}

export default Week;
