import { describe, expect, it } from 'vitest';

import { divisionTargetUrl, weekTargetUrl, yearTargetUrl } from './selector';

describe('yearTargetUrl', () => {
	const availRanks = {
		2023: { weeks: 14, postseason: false },
		2024: { weeks: 15, postseason: true },
	};

	it('keeps a mid-season week when moving to another year', () => {
		const url = yearTargetUrl(availRanks, { sport: 'ncaaf', division: 'fbs', year: '2024', week: '5' }, '2023');
		expect(url).toBe('/ncaaf/ranking/fbs/2023/5');
	});

	it('rewrites "final" to the last plain week when the current year has no postseason', () => {
		const url = yearTargetUrl(availRanks, { sport: 'ncaaf', division: 'fbs', year: '2023', week: '14' }, '2024');
		expect(url).toBe('/ncaaf/ranking/fbs/2024/final');
	});

	it('keeps "final" when moving from a postseason year to another postseason year', () => {
		const url = yearTargetUrl(availRanks, { sport: 'ncaam', division: 'd1', year: '2024', week: 'final' }, '2023');
		expect(url).toBe('/ncaam/ranking/d1/2023/final');
	});
});

describe('weekTargetUrl', () => {
	it('builds the URL for the selected week', () => {
		const url = weekTargetUrl({ sport: 'ncaaf', division: 'fbs', year: '2024', week: '3' }, '7');
		expect(url).toBe('/ncaaf/ranking/fbs/2024/7');
	});

	it('passes "final" through unchanged', () => {
		const url = weekTargetUrl({ sport: 'ncaam', division: 'd1', year: '2024', week: '5' }, 'final');
		expect(url).toBe('/ncaam/ranking/d1/2024/final');
	});
});

describe('divisionTargetUrl', () => {
	it('builds the URL for the selected division, preserving sport/year/week', () => {
		const url = divisionTargetUrl({ sport: 'ncaaf', division: 'fbs', year: '2024', week: '6' }, 'fcs');
		expect(url).toBe('/ncaaf/ranking/fcs/2024/6');
	});
});
