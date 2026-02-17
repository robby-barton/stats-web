import { initRanking } from '@components/ranking';
import { AvailRanks, Rank } from '@lib/types';

import { getIslandProps } from './island-utils';

type RankingData = {
	availRanks: AvailRanks;
	ranking: Rank[];
	division: string;
	year: number;
	week: string;
	sport: string;
};

const island = getIslandProps<RankingData>('ranking');

if (island) {
	const { root, props } = island;
	initRanking(root, props);
}
