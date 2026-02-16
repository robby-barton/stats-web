/* istanbul ignore file */

export const SITE_TITLE = "Robby's Ranking";

export const DIVISIONS: string[] = ['fbs', 'fcs'];

export const CHART_MAX_Y = 150;

export const SPORTS: Record<string, { dbSport: string; divisions: string[] }> = {
	ncaaf: { dbSport: 'ncaaf', divisions: ['fbs', 'fcs'] },
	ncaam: { dbSport: 'ncaam', divisions: ['d1'] },
};

export const ERROR_IMAGES = ['/aspen.png', '/major.png', '/mona.png'];

export const REVALIDATE = 60;
