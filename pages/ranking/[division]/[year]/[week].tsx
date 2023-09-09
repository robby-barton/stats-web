import { ParsedUrlQuery } from 'querystring';

import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from 'next';

import Layout from '@components/layout';
import Meta from '@components/meta';
import Ranking from '@components/ranking';
import Title from '@components/title';
import { DIVISIONS } from '@lib/constants';
import { AvailRanks, Rank, RankingPathParams } from '@lib/types';
import { availableRankings, getRanking, getRankingPathParams } from '@lib/utils';

type WeekProps = {
	availRanks: AvailRanks;
	ranking: Rank[];
	division: string;
	year: number;
	week: string;
};
export default function Week({ availRanks, ranking, division, year, week }: WeekProps) {
	let weekTitle: string = 'Week ' + week;
	if (week === 'Final') {
		weekTitle = week;
	}
	const title: string = [division, year, weekTitle].join(' ');
	const meta = `${weekTitle} computer rankings for the ${year} ${division} college football season.`;

	return (
		<Layout>
			<Title title={title} />
			<Meta desc={meta} />
			<Ranking availRanks={availRanks} ranking={ranking} division={division} year={year} week={week} />
		</Layout>
	);
}

function validateParams(
	params: ParsedUrlQuery | undefined,
	avail: AvailRanks,
): { division: 'fbs' | 'fcs'; year: number; week: string } | string {
	if (params === undefined) {
		return '/';
	}
	const { division, year, week } = params;
	if (typeof division !== 'string' || typeof year !== 'string' || typeof week !== 'string') {
		return '/';
	}

	if (!DIVISIONS.includes(division.toLowerCase()) || !(year in avail)) {
		return '/';
	} else if (week.toLowerCase() === 'final' && !avail[year].postseason) {
		return `/ranking/${division}/${year}/${avail[year].weeks}`;
	} else if (week.toLowerCase() !== 'final') {
		if (!Number.isInteger(Number(week))) {
			return `/ranking/${division}/${year}/${avail[year].postseason ? 'final' : avail[year].weeks}`;
		} else if (Number(week) > avail[year].weeks) {
			return `/ranking/${division}/${year}/${avail[year].postseason ? 'final' : avail[year].weeks}`;
		} else if (Number(week) < 1) {
			return `/ranking/${division}/${year}/1`;
		}
	}

	return {
		division: division.toLowerCase() as 'fbs' | 'fcs',
		year: Number(year),
		week: week,
	};
}

export async function getStaticProps({ params }: GetStaticPropsContext): Promise<GetStaticPropsResult<WeekProps>> {
	const avail: AvailRanks = await availableRankings();
	const validated = validateParams(params, avail);
	if (typeof validated === 'string') {
		return {
			redirect: {
				permanent: false,
				destination: validated,
			},
		};
	}

	const { division, year, week } = validated;
	const results: Rank[] = await getRanking(division === 'fbs' ? true : false, year, week);

	return {
		props: {
			availRanks: avail,
			ranking: results,
			division: division.toUpperCase(),
			year: Number(year),
			week: week.toLowerCase() === 'final' ? 'Final' : week,
		},
	};
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	const paths: RankingPathParams[] = await getRankingPathParams();
	return {
		paths: paths,
		fallback: 'blocking',
	};
}
