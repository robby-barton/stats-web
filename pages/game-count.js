import Layout from '../components/layout';
import Title from '../components/title';
import Meta from '../components/meta';
import Games from '../components/games'
import { makeSerializable, allGames } from '../lib/util'

export default function GameCount({ games }) {
  return (
    <Layout>
      <Title title='Game Count' />
      <Meta desc='Count of games played by day per team' />
      <Games games={games} />
    </Layout>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  const results = await allGames()

  return {
    props: {
      games: makeSerializable(results),
    }
  }
}
