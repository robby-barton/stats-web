/* istanbul ignore file */

import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { getRankingPathParams, getTeamPathParams } from '@lib/utils';

const siteUrl = 'https://cfb.robbybarton.com';

function generateSiteMap(paths: string[]) {
	const date = new Date();
	return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${siteUrl}</loc>
		<lastmod>${date}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>1</priority>
      </url>
      <url>
        <loc>${siteUrl}/game-count</loc>
		<lastmod>${date}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.8</priority>
      </url>
      <url>
        <loc>${siteUrl}/teams</loc>
		<lastmod>${date}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
      </url>
      <url>
        <loc>${siteUrl}/about</loc>
		<lastmod>${date}</lastmod>
		<changefreq>yearly</changefreq>
		<priority>0.5</priority>
      </url>
      ${paths
			.map((path) => {
				return `
          <url>
            <loc>${`${siteUrl}${path}`}</loc>
			<lastmod>${date}</lastmod>
			<changefreq>weekly</changefreq>
			<priority>0.75</priority>
          </url>
        `;
			})
			.join('')}
    </urlset>
  `;
}

export default function SiteMap() {
	// handled by res.write()
}

export async function getServerSideProps({ res }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> {
	const paths: string[] = [];
	const rankingPaths = await getRankingPathParams();
	rankingPaths.map(({ params }) => paths.push(`/ranking/${params.division}/${params.year}/${params.week}`));
	const teamPaths = await getTeamPathParams();
	teamPaths.map(({ params }) => paths.push(`/team/${params.team}`));

	const sitemap = generateSiteMap(paths);

	res.setHeader('Content-Type', 'text/xml');
	res.write(sitemap);
	res.end();

	return {
		props: {},
	};
}
