import dynamic from 'next/dynamic'

import Layout from '../../components/layout';
import Title from '../../components/title';
import Header from '../../components/header';
import Meta from '../../components/meta';
import { getTeamRankings } from '../../lib/util';

const TeamChartNoSSR = dynamic(
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
      <TeamChartNoSSR 
        rankList={rankList}
      />
    </Layout>
  )
}

export async function getServerSideProps({ params, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  const { team } = params

  const results = await getTeamRankings(team)

  return {
    props: {
      rankList: results,
    }
  }
}
