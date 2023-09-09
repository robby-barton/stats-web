import { NextApiRequest, NextApiResponse } from 'next';

import { getRevalidatePaths } from '@lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.query.secret !== process.env.REVALIDATE_SECRET) {
		return res.status(401);
	}

	try {
		const dynamicPaths = await getRevalidatePaths();
		const paths = ['/', '/game-count', '/teams'].concat(dynamicPaths);
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
