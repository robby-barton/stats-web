import { Metadata } from 'next';

import Games from '@components/games';
import { SITE_TITLE } from '@lib/constants';
import { TeamGames } from '@lib/types';
import { allGames } from '@lib/utils';

export const metadata: Metadata = {
	title: SITE_TITLE + ' - Game Count',
	description: 'Count of games played by day per team.',
};

async function getGameCountProps(): Promise<TeamGames[]> {
	const results = await allGames();

	return results;
}

export default async function GameCount() {
	const games = await getGameCountProps();

	return <Games games={games} />;
}
