import useSWR from 'swr';

import Games from '@components/games';
import Layout from '@components/layout';
import Meta from '@components/meta';
import Title from '@components/title';
import { TeamGames } from '@lib/types';
import { fetcher } from '@lib/newutils';

export default function GameCount() {
	const { data: games, error } = useSWR<TeamGames[], Error>('/api/gameCount.json', fetcher, {
		refreshInterval: 60000,
	});

	return (
		<Layout>
			<Title title="Game Count" />
			<Meta desc="Count of games played by day per team" />
			{games && !error ? <Games games={games} /> : <></>}
		</Layout>
	);
}
