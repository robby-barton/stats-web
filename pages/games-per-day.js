import Layout from '../components/layout';
import Title from '../components/title';
import Meta from '../components/meta';
import GameTable from '../components/gameTable'
import { makeSerializable, allGames } from '../lib/util'

export default function GamesPerDay({ games }) {
  return (
    <Layout>
      <Title title='Games by Day' />
      <Meta desc='Games played by day per team' />
      <GameTable games={games} />
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
