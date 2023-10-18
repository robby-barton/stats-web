import useSWR from 'swr';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import Layout from '@components/layout';
import Meta from '@components/meta';
import TeamName from '@components/teamName';
import Title from '@components/title';
import { ChartPoint, Team } from '@lib/types';
import { fetcher } from '@lib/newutils';
import styles from '@pages/team/[team].module.css';

const TeamChart = dynamic(() => import('@components/teamChart'), {
	ssr: false,
});

type TeamProps = {
	team: Team;
	rank_list: ChartPoint[];
	years: number[];
};

export default function Team() {
	const router = useRouter();
	const teamID = router.query.team as string;
	const { data: teamData, error } = useSWR<TeamProps, Error>(`https://data.robby.tech/team/${teamID}.json`, fetcher, {
		refreshInterval: 60000,
	});

	if (error) {
		router.push('/');
	}

	if (!teamData) {
		return <Layout></Layout>;
	}

	const { team, rank_list, years } = teamData;

	const meta = `${team.name} historical rankings.`;

	return (
		<Layout>
			<Title title={team.name} />
			<Meta desc={meta} />
			<div className={styles.teamName}>
				<TeamName team={team} />
			</div>
			<TeamChart rankList={rank_list} years={years} />
		</Layout>
	);
}
