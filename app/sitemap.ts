import { MetadataRoute } from 'next';

import { RankingPath, TeamPath } from '@lib/types';
import { getRankingPaths, getTeamPaths } from '@lib/utils';

const baseUrl = 'https://cfb.robbybarton.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const date = new Date();

	// add static routes
	const paths = [
		{
			url: baseUrl,
			lastModified: date,
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: baseUrl + '/game-count',
			lastModified: date,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: baseUrl + '/about',
			lastModified: date,
			changeFrequency: 'yearly',
		},
		{
			url: baseUrl + '/teams',
			lastModified: date,
			changeFrequency: 'yearly',
		},
	];

	const rankingPaths = await getRankingPaths();
	rankingPaths.map((params: RankingPath) =>
		paths.push({
			url: baseUrl + `/ranking/${params.division}/${params.year}/${params.week}`,
			lastModified: date,
			changeFrequency: 'weekly',
			priority: 0.75,
		}),
	);

	const teamPaths = await getTeamPaths();
	teamPaths.map((params: TeamPath) =>
		paths.push({
			url: baseUrl + `/team/${params.team}`,
			lastModified: date,
			changeFrequency: 'weekly',
			priority: 0.75,
		}),
	);

	return paths;
}
