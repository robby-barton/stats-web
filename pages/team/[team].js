import dynamic from 'next/dynamic'
import Layout from '../../components/layout';
import Title from '../../components/title';
import Meta from '../../components/meta';
import { getTeamRankings, getTeamPathParams } from '../../lib/utils';
import { CHART_MAX_Y } from '../../lib/constants';

const TeamChart = dynamic(
  () => import('../../components/teamChart'),
  { ssr: false }
)

export default function Team({ team, rankList, years }) {
  const teamName = team
  const title = teamName
  const meta = `${teamName} historical rankings.`

  return (
    <Layout>
      <Title title={title} />
      <Meta desc={meta} />
      <h2>{teamName}</h2>
      <TeamChart
        rankList={rankList}
        years={years}
      />
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const { team } = params

  const results = await getTeamRankings(team)
  const data = [];
  const years = [];
  for (let i = 0; i < results.length; i++) {
    data.push({
      week: `${results[i].year} Week ${results[i].postseason ? "Final" : results[i].week}`,
      rank: results[i].final_rank,
      fillLevel: CHART_MAX_Y,
    })
    if (!years.includes(results[i].year)) {
      years.push(results[i].year)
    }
  }

  return {
    props: {
      team: results[0]['name'],
      rankList: data,
      years: years,
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  const paths = await getTeamPathParams()
  return {
    paths: paths,
    fallback: 'blocking',
  }
}
