import Head from 'next/head';
import Layout from '../components/layout';
import Title from '../components/title';
import ResultList from '../components/resultList';
import utilStyles from '../styles/utils.module.css';
import { availableRankings } from '../lib/util';
import prisma from '../lib/prisma';

export default function Home({ fbs }) {
  return (
    <Layout home>
      <Title />
      <section className={utilStyles.heading2Xl}>
        <p>Robby's Ranking</p>
      </section>
      <ResultList teamList={fbs} />
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

  var fbs = null

  if (currYear.postseason) {
    fbs = await prisma.team_week_results.findMany({
      where: {
        year: Number(year),
        fbs: true,
        postseason: Number(1),
      },
      include: {
        team_names: true,
      },
      orderBy: [
        {
          final_rank: 'asc',
        },
      ],
    })
  } else {
    fbs = await prisma.team_week_results.findMany({
      where: {
        year: Number(year),
        week: Number(currYear.weeks),
        fbs: true,
        postseason: Number(0),
      },
      include: {
        team_names: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          final_rank: 'asc',
        },
      ],
    })
  }

  return {
    props: {
      fbs: fbs,
    },
  }
}
