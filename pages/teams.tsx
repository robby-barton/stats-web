import { GetStaticPropsResult } from "next";

import Layout from "@components/layout";
import Meta from "@components/meta";
import TeamSearch from "@components/teamSearch";
import Title from "@components/title";
import { Team } from "@lib/types";
import { getRankedTeams } from "@lib/utils";

export type TeamsProps = {
	teams: Team[];
};

export default function Teams({ teams }: TeamsProps) {
	return (
		<Layout>
			<Title title="Teams" />
			<Meta desc="Teams included in one or more rankings" />
			<TeamSearch teams={teams} />
		</Layout>
	);
}

export async function getStaticProps(): Promise<GetStaticPropsResult<TeamsProps>> {
	const results: Team[] = await getRankedTeams();
	results.sort((a, b) => {
		return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
	});

	return {
		props: {
			teams: results,
		},
	};
}
