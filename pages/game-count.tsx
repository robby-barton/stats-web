import { GetStaticPropsResult } from 'next';
import Layout from '../components/layout';
import Title from '../components/title';
import Meta from '../components/meta';
import Games from '../components/games';
import { allGames } from '../lib/dbFuncs';
import { TeamGames } from '../lib/types';

type GameCountProps = {
	games: TeamGames[];
}

export default function GameCount({ games }: GameCountProps) {
	return (
		<Layout>
			<Title title='Game Count' />
			<Meta desc='Count of games played by day per team' />
			<Games games={games} />
		</Layout>
	);
}

export async function getStaticProps(): Promise<GetStaticPropsResult<GameCountProps>> {
	const results = await allGames()

	return {
		props: {
			games: results,
		},
		revalidate: 60,
	}
}
