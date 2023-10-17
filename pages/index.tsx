import Layout from '@components/layout';
import Meta from '@components/meta';
import Ranking from '@components/ranking';
import Title from '@components/title';
import { AvailRanks, Rank } from '@lib/types';
import useSWR from 'swr';

async function fetcher<JSON>(input: RequestInfo): Promise<JSON> {
	const res = await fetch(input);
	return res.json();
}

export default function Home() {
	const { data: availRanks, error: arError } = useSWR<AvailRanks, Error>('/api/availRanks.json', fetcher, {
		refreshInterval: 60000,
	});

	let year = new Date().getFullYear();
	let currWeek = 'final';
	if (availRanks) {
		if (!(year.toString() in availRanks)) {
			year -= 1;
		}
		const { weeks, postseason } = availRanks[year.toString()];
		if (!postseason) {
			currWeek = weeks.toString();
		}
	}
	const { data: fbs, error: fbsError } = useSWR<Rank[], Error>('/api/latest.json', fetcher, {
		refreshInterval: 60000,
	});
	return (
		<Layout>
			<Title />
			<Meta desc="Computer rankings for to FBS and FCS college football seasons." />
			{fbs && !fbsError && availRanks && !arError ? (
				<Ranking availRanks={availRanks} ranking={fbs} division={'fbs'} year={year} week={currWeek} />
			) : (
				<></>
			)}
		</Layout>
	);
}
