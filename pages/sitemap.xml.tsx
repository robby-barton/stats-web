/* istanbul ignore file */

import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

import { getDynamicPaths } from "@lib/utils";

const siteUrl = "https://cfb.robbybarton.com";

function generateSiteMap(paths: string[]) {
	return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${siteUrl}</loc>
      </url>
      <url>
        <loc>${siteUrl}/game-count</loc>
      </url>
      <url>
        <loc>${siteUrl}/teams</loc>
      </url>
      <url>
        <loc>${siteUrl}/about</loc>
      </url>
      ${paths
			.map((path) => {
				return `
          <url>
            <loc>${`${siteUrl}${path}`}</loc>
          </url>
        `;
			})
			.join("")}
    </urlset>
  `;
}

export default function SiteMap() {
	// handled by res.write()
}

export async function getServerSideProps({ res }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> {
	const paths = await getDynamicPaths();

	const sitemap = generateSiteMap(paths);

	res.setHeader("Content-Type", "text/xml");
	res.write(sitemap);
	res.end();

	return {
		props: {},
	};
}
