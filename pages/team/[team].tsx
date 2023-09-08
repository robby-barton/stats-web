import { ParsedUrlQuery } from "querystring";

import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next";
import dynamic from "next/dynamic";

import Layout from "@components/layout";
import Meta from "@components/meta";
import TeamName from "@components/teamName";
import Title from "@components/title";
import { CHART_MAX_Y } from "@lib/constants";
import { ChartPoint, Team, TeamPathParams, TeamRank } from "@lib/types";
import { getTeamPathParams, getTeamRankings } from "@lib/utils";
import styles from "@pages/team/[team].module.css";

const TeamChart = dynamic(() => import("@components/teamChart"), {
	ssr: false,
});

type TeamProps = {
	team: Team;
	rankList: ChartPoint[];
	years: number[];
};

export default function Team({ team, rankList, years }: TeamProps) {
	const meta = `${team.name} historical rankings.`;

	return (
		<Layout>
			<Title title={team.name} />
			<Meta desc={meta} />
			<div className={styles.teamName}>
				<TeamName team={team} />
			</div>
			<TeamChart rankList={rankList} years={years} />
		</Layout>
	);
}

function validateParams(params: ParsedUrlQuery | undefined): number {
	if (params === undefined) {
		return 0;
	}

	const teamString = params["team"];
	if (typeof teamString !== "string") {
		return 0;
	}

	const teamId = Number(teamString);
	if (!Number.isInteger(teamId)) {
		return 0;
	}

	return teamId;
}

export async function getStaticProps({ params }: GetStaticPropsContext): Promise<GetStaticPropsResult<TeamProps>> {
	const team: number = validateParams(params);
	if (!team) {
		return {
			redirect: {
				permanent: false,
				destination: "/teams",
			},
		};
	}

	const results: TeamRank[] = await getTeamRankings(team);
	if (!results.length) {
		return {
			redirect: {
				permanent: false,
				destination: "/teams",
			},
		};
	}

	const data: ChartPoint[] = [];
	const years: number[] = [];
	for (let i = 0; i < results.length; i++) {
		data.push({
			week: `${results[i].year} Week ${results[i].postseason ? "Final" : results[i].week}`,
			rank: results[i].final_rank,
			fillLevel: CHART_MAX_Y,
		});
		if (!years.includes(results[i].year)) {
			years.push(results[i].year);
		}
	}

	return {
		props: {
			team: results[0].team,
			rankList: data,
			years: years,
		},
	};
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	const paths: TeamPathParams[] = await getTeamPathParams();
	return {
		paths: paths,
		fallback: "blocking",
	};
}
