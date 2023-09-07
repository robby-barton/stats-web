import { Metadata } from 'next';

import Ranking from '@components/ranking';
import { SITE_TITLE } from '@lib/constants';
import { AvailRanks, Rank } from '@lib/types';
import { availableRankings, getRanking } from '@lib/utils';

export const metadata: Metadata = {
	title: SITE_TITLE,
	description: 'Computer rankings for to FBS and FCS college football seasons.',
};

type HomeProps = {
	availRanks: AvailRanks;
	fbs: Rank[];
	year: number;
	week: string;
};

async function getHomeProps(): Promise<HomeProps> {
	const avail: AvailRanks = await availableRankings();
	let year = -1;
	for (const key in avail) {
		const keyNum = Number(key);
		if (keyNum > year) {
			year = keyNum;
		}
	}

	const currYear = avail[year.toString()];

	const fbs: Rank[] = await getRanking(true, year, currYear.postseason ? 'final' : currYear.weeks.toString());

	return {
		availRanks: avail,
		fbs: fbs,
		year: year,
		week: currYear.postseason ? 'final' : currYear.weeks.toString(),
	};
}

export default async function Home() {
	const { availRanks, fbs, year, week } = await getHomeProps();

	return <Ranking availRanks={availRanks} ranking={fbs} division={'fbs'} year={year} week={week} />;
}
