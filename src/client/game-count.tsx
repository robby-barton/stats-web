import { createRoot } from 'react-dom/client';

import Games from '@components/games';
import { ThemeProvider } from '@components/themeProvider';
import { TeamGames } from '@lib/types';

import { getIslandProps } from './island-utils';

type GameCountData = {
	games: TeamGames[];
};

const island = getIslandProps<GameCountData>('game-count');

if (island) {
	const { root, props } = island;
	createRoot(root).render(
		<ThemeProvider>
			<Games games={props.games} />
		</ThemeProvider>,
	);
}
