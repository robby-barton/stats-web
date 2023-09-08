import { GetStaticPropsResult } from "next";

import Layout from "@components/layout";
import Meta from "@components/meta";
import Ranking from "@components/ranking";
import Title from "@components/title";
import { AvailRanks, Rank } from "@lib/types";
import { availableRankings, getRanking } from "@lib/utils";

type HomeProps = {
	availRanks: AvailRanks;
	fbs: Rank[];
	year: number;
	week: string;
};

export default function Home({ availRanks, fbs, year, week }: HomeProps) {
	return (
		<Layout>
			<Title />
			<Meta desc="Computer rankings for to FBS and FCS college football seasons." />
			<Ranking availRanks={availRanks} ranking={fbs} division={"fbs"} year={year} week={week} />
		</Layout>
	);
}

export async function getStaticProps(): Promise<GetStaticPropsResult<HomeProps>> {
	const avail: AvailRanks = await availableRankings();
	let year = -1;
	for (const key in avail) {
		const keyNum = Number(key);
		if (keyNum > year) {
			year = keyNum;
		}
	}

	const currYear = avail[year.toString()];

	const fbs: Rank[] = await getRanking(true, year, currYear.postseason ? "final" : currYear.weeks.toString());

	return {
		props: {
			availRanks: avail,
			fbs: fbs,
			year: year,
			week: currYear.postseason ? "final" : currYear.weeks.toString(),
		},
	};
}
