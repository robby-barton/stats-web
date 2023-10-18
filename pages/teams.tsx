import useSWR from 'swr';

import Layout from '@components/layout';
import Meta from '@components/meta';
import TeamSearch from '@components/teamSearch';
import Title from '@components/title';
import { Team } from '@lib/types';
import { fetcher } from '@lib/newutils';

export default function Teams() {
	const { data: teams, error } = useSWR<Team[], Error>('https://data.robby.tech/teams.json', fetcher, {
		refreshInterval: 60000,
	});

	if (teams) {
		teams.sort((a, b) => {
			return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
		});
	}

	return (
		<Layout>
			<Title title="Teams" />
			<Meta desc="Teams included in one or more rankings" />
			{teams && !error ? <TeamSearch teams={teams} /> : <></>}
		</Layout>
	);
}
