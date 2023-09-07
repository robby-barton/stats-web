import { Metadata } from 'next';

import TeamSearch from '@components/teamSearch';
import { SITE_TITLE } from '@lib/constants';
import { Team } from '@lib/types';
import { getRankedTeams } from '@lib/utils';

export const metadata: Metadata = {
	title: SITE_TITLE + ' - Teams',
	description: 'Teams included in one or more rankings.',
};

async function getTeamsProps(): Promise<Team[]> {
	const results: Team[] = await getRankedTeams();
	results.sort((a, b) => {
		return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
	});

	return results;
}

export default async function Teams() {
	const teams = await getTeamsProps();

	return <TeamSearch teams={teams} />;
}
