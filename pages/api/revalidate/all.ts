import { NextApiRequest, NextApiResponse } from 'next';

import { getRankingPathParams, getTeamPathParams } from '@lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.query.secret !== process.env.REVALIDATE_SECRET) {
		return res.status(401);
	}

	try {
		const paths = ['/', '/game-count', '/teams'];
		const rankingPaths = await getRankingPathParams();
		rankingPaths.map(({ params }) => paths.push(`/ranking/${params.division}/${params.year}/${params.week}`));
		const teamPaths = await getTeamPathParams();
		teamPaths.map(({ params }) => paths.push(`/team/${params.team}`));
		paths.forEach(async (path) => {
			await res.revalidate(path);
			console.log(`revalidating ${path}`);
		});

		console.log('finished');
		return res.status(200).end('revalidated');
	} catch {
		return res.status(500).end('error');
	}
}
