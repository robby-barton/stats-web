import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import Ranking from '@components/ranking';
import { DIVISIONS, SITE_TITLE } from '@lib/constants';
import { AvailRanks, Rank, RankingPath } from '@lib/types';
import { availableRankings, getRanking, getRankingPaths } from '@lib/utils';

type WeekProps = {
	availRanks: AvailRanks;
	ranking: Rank[];
	division: string;
	year: number;
	week: string;
};

export async function generateStaticParams(): Promise<RankingPath[]> {
	const paths: RankingPath[] = await getRankingPaths();

	return paths;
}

function validateParams(
	params: RankingPath,
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

async function getWeekProps(params: RankingPath): Promise<WeekProps> {
	const avail: AvailRanks = await availableRankings();
	const validated = validateParams(params, avail);
	if (typeof validated === 'string') {
		redirect(validated);
	}

	const { division, year, week } = validated;
	const results: Rank[] = await getRanking(division === 'fbs' ? true : false, year, week);

	return {
		availRanks: avail,
		ranking: results,
		division: division.toUpperCase(),
		year: Number(year),
		week: week.toLowerCase() === 'final' ? 'Final' : week,
	};
}

export async function generateMetadata({ params }: { params: RankingPath }): Promise<Metadata> {
	const { division, year, week } = await getWeekProps(params);
	let weekTitle: string = 'Week ' + week;
	if (week === 'Final') {
		weekTitle = week;
	}
	const title: string = [division, year, weekTitle].join(' ');
	const meta = `${weekTitle} computer rankings for the ${year} ${division} college football season.`;

	return {
		title: SITE_TITLE + ` - ${title}`,
		description: meta,
	};
}

export default async function Week({ params }: { params: RankingPath }) {
	const { availRanks, ranking, division, year, week } = await getWeekProps(params);

	return <Ranking availRanks={availRanks} ranking={ranking} division={division} year={year} week={week} />;
}
