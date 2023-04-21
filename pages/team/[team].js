import dynamic from 'next/dynamic'

import Layout from '../../components/layout';
import Title from '../../components/title';
import Header from '../../components/header';
import Meta from '../../components/meta';
import { getTeamRankings, getUniqueTeams } from '../../lib/utils';

const TeamChart = dynamic(
  () => import('../../components/teamChart'),
  { ssr: false }
)

export default function Team({ rankList }) {
  const teamName = rankList[0]['name']
  const title = teamName
  const meta = `${teamName} historical rankings.`

  return (
    <Layout>
      <Title title={title} />
      <Meta desc={meta} />
      <h2>{teamName}</h2>
      <TeamChart
        rankList={rankList}
      />
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const { team } = params

  const results = await getTeamRankings(team)

  return {
    props: {
      rankList: results,
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  const results = await getUniqueTeams()
  const paths = results.map(team => ({ params: { team: team.team_id.toString() }}))
  return {
    paths: paths,
    fallback: 'blocking',
  }
}
