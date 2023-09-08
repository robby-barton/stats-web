import { NextApiRequest, NextApiResponse } from "next";

import { getDynamicPaths } from "@lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.query.secret !== process.env.REVALIDATE_SECRET) {
		return res.status(401);
	}

	try {
		const dynamicPaths = await getDynamicPaths();
		const paths = ["/", "/game-count", "/teams"].concat(dynamicPaths);
		paths.forEach(async (path) => {
			await res.revalidate(path);
		});

		return res.status(200);
	} catch {
		return res.status(500);
	}
}
