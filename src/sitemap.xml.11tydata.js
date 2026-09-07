const { execFileSync } = require('child_process');
const path = require('path');
const { getRankingPathParams, getTeamPathParams } = require('../eleventy/lib/utils');

// Reproducible builds: use the HEAD commit time instead of the wall clock so
// builds of the same commit produce identical output. If git is unavailable
// (e.g. a non-git deploy checkout), fall back to the epoch.
function headCommitTime() {
	try {
		return execFileSync('git', ['log', '-1', '--format=%cI'], {
			cwd: path.resolve(__dirname, '..'),
			encoding: 'utf-8',
		}).trim();
	} catch {
		return '1970-01-01T00:00:00+00:00';
	}
}

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
		lastmod: headCommitTime(),
	};
};
