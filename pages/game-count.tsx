import { GetStaticPropsResult } from 'next';

import Games from '@components/games';
import Layout from '@components/layout';
import Meta from '@components/meta';
import Title from '@components/title';
import { TeamGames } from '@lib/types';
import { allGames } from '@lib/utils';
import { REVALIDATE } from '@lib/constants';

type GameCountProps = {
	games: TeamGames[];
};

export default function GameCount({ games }: GameCountProps) {
	return (
		<Layout>
			<Title title="Game Count" />
			<Meta desc="Count of games played by day per team" />
			<Games games={games} />
		</Layout>
	);
}

export async function getStaticProps(): Promise<GetStaticPropsResult<GameCountProps>> {
	const results = await allGames();

	return {
		props: {
			games: results,
		},
		revalidate: REVALIDATE,
	};
}
