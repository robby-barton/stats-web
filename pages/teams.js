import Layout from '../components/layout';
import Title from '../components/title';
import Meta from '../components/meta';
import TeamSearch from '../components/teamSearch';
import { getUniqueTeams } from '../lib/util';

export default function Teams({ teams }) {
  return (
    <Layout>
      <Title title='Teams' />
      <Meta desc='Teams included in one or more rankings' />
      <TeamSearch teams={teams} />
    </Layout>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  const results = await getUniqueTeams()

  return {
    props: {
      teams: results,
    }
  }
}