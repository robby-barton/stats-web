import { createRoot } from 'react-dom/client';

import Ranking from '@components/ranking';
import { ThemeProvider } from '@components/themeProvider';
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
	createRoot(root).render(
		<ThemeProvider>
			<Ranking
				availRanks={props.availRanks}
				ranking={props.ranking}
				division={props.division}
				year={props.year}
				week={props.week}
				sport={props.sport}
			/>
		</ThemeProvider>,
	);
}
