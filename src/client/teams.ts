import { initTeamSearch } from '@components/teamSearch';
import { Team } from '@lib/types';

import { getIslandProps } from './island-utils';

type TeamsData = {
	teams: Team[];
};

const island = getIslandProps<TeamsData>('teams');

if (island) {
	const { root, props } = island;
	initTeamSearch(root, props.teams);
}
