import Head from 'next/head';
import Layout from '../components/layout';
import Title from '../components/title';
import ResultTable from '../components/resultTable';
import utilStyles from '../styles/utils.module.css';
import { availableRankings, getRanking } from '../lib/util';

export default function Home({ rankList, fbs, year, week }) {
  return (
    <Layout home>
      <Title />
      <section className={utilStyles.heading2Xl}>
        <p>Robby's Ranking</p>
      </section>
      <ResultTable 
        rankList={rankList}
        teamList={fbs}
        division={'fbs'}
        year={year}
        week={week}
      />
    </Layout>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  const avail = await availableRankings()
  var year = 0
  for (var key in avail) {
    if (key > year) {
      year = key
    }
  }

  const currYear = avail[year]

  const fbs = await getRanking(true, year,
    currYear.postseason ? 'final' : currYear.weeks.toString())

  return {
    props: {
      rankList: avail,
      fbs: fbs,
      year: year,
      week: currYear.postseason ? 'final' : currYear.weeks.toString()
    },
  }
}
