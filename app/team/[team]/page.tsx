import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

import TeamName from '@components/teamName';
import { CHART_MAX_Y, SITE_TITLE } from '@lib/constants';
import { ChartPoint, Team, TeamPath, TeamRank } from '@lib/types';
import { getTeam, getTeamPaths, getTeamRankings } from '@lib/utils';

import styles from './styles.module.css';

const TeamChart = dynamic(() => import('@components/teamChart'), { ssr: false });

type TeamProps = {
	team: Team;
	rankList: ChartPoint[];
	years: number[];
};

export async function generateStaticParams() {
	const paths: TeamPath[] = await getTeamPaths();

	return paths;
}

async function getTeamProps(team: string): Promise<TeamProps> {
	const teamId = Number(team);
	if (!Number.isInteger(teamId)) {
		redirect('/teams');
	}

	const results: TeamRank[] = await getTeamRankings(teamId);
	if (!results.length) {
		redirect('/teams');
	}

	const data: ChartPoint[] = [];
	const years: number[] = [];
	for (let i = 0; i < results.length; i++) {
		data.push({
			week: `${results[i].year} Week ${results[i].postseason ? 'Final' : results[i].week}`,
			rank: results[i].final_rank,
			fillLevel: CHART_MAX_Y,
		});
		if (!years.includes(results[i].year)) {
			years.push(results[i].year);
		}
	}

	return {
		team: results[0].team,
		rankList: data,
		years: years,
	};
}

export async function generateMetadata({ params }: { params: { team: string } }): Promise<Metadata> {
	const teamId = Number(params.team);
	if (!Number.isInteger(teamId)) {
		return {};
	}

	const team = await getTeam(teamId);
	if (team === null) {
		return {};
	}

	return {
		title: SITE_TITLE + ` - ${team.name}`,
		description: `${team.name} historical rankings.`,
	};
}

export default async function Team({ params }: { params: { team: string } }) {
	const { team: team, rankList, years } = await getTeamProps(params.team);

	return (
		<>
			<div className={styles.teamName}>
				<TeamName team={team} />
			</div>
			<TeamChart rankList={rankList} years={years} />
		</>
	);
}
