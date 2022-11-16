import Head from 'next/head';
import Layout from '../../../components/layout';
import Title from '../../../components/title';
import ResultList from '../../../components/resultList';
import Error from 'next/error';
import prisma from '../../../lib/prisma';
import utilStyles from '../../../styles/utils.module.css';

const Week = props => {
  if (!props.results) {
    return <Error statusCode={404} />
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
        <p>{title}</p>
      </section>
      <ResultList teamList={props.results} />
    </Layout>
  )
}

export async function getServerSideProps({ params, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  const { division, year, week } = params
  var results = null
  var fbs = false
  if (division === 'fbs') {
    fbs = true
  } else if (division !== 'fcs') {
    return {
      props: { results: null }
    }
  }
  if (week === "final") {
    results = await prisma.team_week_results.findMany({
      where: {
        year: Number(year),
        fbs: fbs,
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
    results = await prisma.team_week_results.findMany({
      where: {
        year: Number(year),
        week: Number(week),
        fbs: fbs,
        postseason: Number(0),
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
  }

  return {
    props: {
      division: division.toUpperCase(),
      year: year,
      week: week === 'final' ? 'Final' : week,
      results: results,
    }
  }
}

export default Week;
