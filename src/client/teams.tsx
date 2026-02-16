import { createRoot } from 'react-dom/client';

import TeamSearch from '@components/teamSearch';
import { ThemeProvider } from '@components/themeProvider';
import { Team } from '@lib/types';

import { getIslandProps } from './island-utils';

type TeamsData = {
	teams: Team[];
};

const island = getIslandProps<TeamsData>('teams');

if (island) {
	const { root, props } = island;
	createRoot(root).render(
		<ThemeProvider>
			<TeamSearch teams={props.teams} />
		</ThemeProvider>,
	);
}
