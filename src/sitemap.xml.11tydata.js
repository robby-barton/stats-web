const { getRankingPathParams, getTeamPathParams } = require('../eleventy/lib/utils');

module.exports = async function () {
	const paths = [];
	const rankingPaths = await getRankingPathParams();
	rankingPaths.map(({ params }) =>
		paths.push(`/${params.sport}/ranking/${params.division}/${params.year}/${params.week}`),
	);
	const teamPaths = await getTeamPathParams();
	teamPaths.map(({ params }) => paths.push(`/team/${params.team}`));

	return {
		permalink: '/sitemap.xml',
		paths,
		lastmod: new Date().toISOString(),
	};
};
