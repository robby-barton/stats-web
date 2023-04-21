import Layout from '../components/layout';
import Title from '../components/title';
import Meta from '../components/meta';
import TeamSearch from '../components/teamSearch';
import { getUniqueTeams } from '../lib/utils';

export default function Teams({ teams }) {
  return (
    <Layout>
      <Title title='Teams' />
      <Meta desc='Teams included in one or more rankings' />
      <TeamSearch teams={teams} />
    </Layout>
  );
}

export async function getStaticProps() {
  const results = await getUniqueTeams()

  return {
    props: {
      teams: results,
    },
    revalidate: 60,
  }
}
