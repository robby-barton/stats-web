import Layout from '../components/layout';
import Title from '../components/title';
import Meta from '../components/meta';
import Ranking from '../components/ranking';
import { availableRankings, getRanking } from '../lib/dbFuncs';
import { AvailRanks, Rank } from '../lib/types';
import { GetStaticPropsResult } from 'next';

type HomeProps = {
	availRanks: AvailRanks;
	fbs: Rank[];
	year: number;
	week: string;
}

export default function Home({ availRanks, fbs, year, week }: HomeProps) {
	return (
		<Layout>
			<Title />
			<Meta desc="Computer rankings for to FBS and FCS college football seasons." />
			<Ranking
				availRanks={availRanks}
				ranking={fbs}
				division={'fbs'}
				year={year}
				week={week}
			/>
		</Layout>
	);
}

export async function getStaticProps(): Promise<GetStaticPropsResult<HomeProps>> {
	const avail: AvailRanks = await availableRankings()
	let year: number = 0
	for (let key in avail) {
		let keyNum: number = Number(key)
		if (keyNum > year) {
			year = keyNum
		}
	}

	const currYear = avail[year]

	const fbs: Rank[] = await getRanking(true, year,
		currYear.postseason ? 'final' : currYear.weeks.toString())

	return {
		props: {
			availRanks: avail,
			fbs: fbs,
			year: year,
			week: currYear.postseason ? 'final' : currYear.weeks.toString()
		},
		revalidate: 60,
	}
}
