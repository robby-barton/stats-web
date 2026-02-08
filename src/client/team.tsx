import { createRoot } from 'react-dom/client';

import TeamChart from '@components/teamChart';
import TeamName from '@components/teamName';
import { ThemeProvider } from '@components/themeProvider';
import { ChartPoint, Team } from '@lib/types';
import styles from '@pages/team/[team].module.css';

import { getIslandProps } from './island-utils';

type TeamData = {
	team: Team;
	rankList: ChartPoint[];
	years: number[];
};

function TeamIsland({ team, rankList, years }: TeamData) {
	return (
		<>
			<div className={styles.teamName}>
				<TeamName team={team} />
			</div>
			<TeamChart rankList={rankList} years={years} />
		</>
	);
}

const island = getIslandProps<TeamData>('team');

if (island) {
	const { root, props } = island;
	createRoot(root).render(
		<ThemeProvider>
			<TeamIsland team={props.team} rankList={props.rankList} years={props.years} />
		</ThemeProvider>,
	);
}
