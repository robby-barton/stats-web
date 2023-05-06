import { GetStaticPropsResult } from "next";

import Layout from "@components/layout";
import Meta from "@components/meta";
import TeamSearch from "@components/teamSearch";
import Title from "@components/title";
import { getUniqueTeams } from "@lib/dbFuncs";
import { Team } from "@lib/types";

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
	const results: Team[] = await getUniqueTeams();

	return {
		props: {
			teams: results,
		},
		revalidate: 60,
	};
}
