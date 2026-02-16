import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import TeamChart from '@components/teamChart';
import TeamName from '@components/teamName';
import { ThemeProvider } from '@components/themeProvider';
import { SportTeamData, Team } from '@lib/types';
import styles from '@components/teamPage.module.css';

import { getIslandProps } from './island-utils';

type TeamData = {
	team: Team;
	sports: Record<string, SportTeamData>;
};

function TeamIsland({ team, sports }: TeamData) {
	const sportKeys = Object.keys(sports);

	const hashSport = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
	const initialTab = sportKeys.includes(hashSport) ? hashSport : sportKeys[0];
	const [activeTab, setActiveTab] = useState(initialTab);

	const activeSport = sports[activeTab];

	return (
		<>
			<div className={styles.teamName}>
				<TeamName team={team} />
			</div>
			{sportKeys.length > 1 && (
				<div className={styles.tabs}>
					{sportKeys.map((key) => (
						<button
							key={key}
							className={`${styles.tab} ${key === activeTab ? styles.tabActive : ''}`}
							onClick={() => setActiveTab(key)}
						>
							{key.toUpperCase()}
						</button>
					))}
				</div>
			)}
			<TeamChart
				key={activeTab}
				rankList={activeSport.rankList}
				years={activeSport.years}
				chartMaxY={activeSport.chartMaxY}
			/>
		</>
	);
}

const island = getIslandProps<TeamData>('team');

if (island) {
	const { root, props } = island;
	createRoot(root).render(
		<ThemeProvider>
			<TeamIsland team={props.team} sports={props.sports} />
		</ThemeProvider>,
	);
}
