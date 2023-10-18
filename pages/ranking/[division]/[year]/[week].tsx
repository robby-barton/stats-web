import useSWR from 'swr';

import { useRouter } from 'next/router';

import Layout from '@components/layout';
import Meta from '@components/meta';
import Ranking from '@components/ranking';
import Title from '@components/title';
import { AvailRanks, Rank } from '@lib/types';
import { fetcher } from '@lib/newutils';

export default function Week() {
	const { data: availRanks, error: arError } = useSWR<AvailRanks, Error>(
		'https://data.robby.tech/availRanks.json',
		fetcher,
		{
			refreshInterval: 60000,
		},
	);

	const router = useRouter();
	const division = router.query.division as string;
	const year = router.query.year as string;
	const week = router.query.week as string;
	const { data: ranking, error } = useSWR<Rank[], Error>(
		`https://data.robby.tech/ranking/${year}/${division ? division.toLowerCase() : division}/${
			week ? week.toLowerCase() : week
		}.json`,
		fetcher,
		{
			refreshInterval: 60000,
		},
	);

	if (error || arError) {
		router.push('/');
	}

	if (!ranking || !availRanks || !division || !year || !week) {
		return <Layout></Layout>;
	}

	let weekTitle: string = 'Week ' + week;
	if (week.toLowerCase() === 'final') {
		weekTitle = 'Final';
	}
	const title: string = [division, year, weekTitle].join(' ');
	const meta = `${weekTitle} computer rankings for the ${year} ${division} college football season.`;

	return (
		<Layout>
			<Title title={title} />
			<Meta desc={meta} />
			<Ranking availRanks={availRanks} ranking={ranking} division={division} year={Number(year)} week={week} />
		</Layout>
	);
}
