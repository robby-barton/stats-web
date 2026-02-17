import { initGames } from '@components/games';
import { TeamGames } from '@lib/types';

import { getIslandProps } from './island-utils';

type GameCountData = {
	games: TeamGames[];
};

const island = getIslandProps<GameCountData>('game-count');

if (island) {
	const { root, props } = island;
	initGames(root, props.games);
}
