import { describe, expect, it } from 'vitest';

import { espnCombinerUrl, getLogoSrc } from './logo';

const ESPN_LOGO = 'https://a.espncdn.com/i/teamlogos/ncaa/500/atlantic-city-nas.png';
const ESPN_DARK_LOGO = 'https://a.espncdn.com/i/teamlogos/ncaa/500-dark/atlantic-city-nas.png';
const DISALLOWED_LOGO = 'https://tracker.example.com/pixel/team.png';

function team(overrides = {}) {
	return { team_id: 1, name: 'Alpha', logo: ESPN_LOGO, logo_dark: ESPN_DARK_LOGO, ...overrides };
}

describe('getLogoSrc', () => {
	it('passes an allowlisted light-mode logo through the ESPN combiner at 64px', () => {
		expect(getLogoSrc('light', team())).toBe(espnCombinerUrl('/i/teamlogos/ncaa/500/atlantic-city-nas.png', 64));
	});

	it('uses logo_dark in dark mode', () => {
		expect(getLogoSrc('dark', team())).toBe(
			espnCombinerUrl('/i/teamlogos/ncaa/500-dark/atlantic-city-nas.png', 64),
		);
	});

	it('passes allowlisted URLs without an NCAA logo path through unchanged', () => {
		const t = team({ logo: 'https://a.espncdn.com/some/other/image.png' });
		expect(getLogoSrc('light', t)).toBe('https://a.espncdn.com/some/other/image.png');
	});

	it('falls back to the error image for a non-allowlisted host', () => {
		const t = team({ logo: DISALLOWED_LOGO, logo_dark: DISALLOWED_LOGO });
		expect(getLogoSrc('light', t)).toBe('/major.png'); // team_id 1 % 3
	});

	it('falls back to the error image when the logo is empty', () => {
		const t = team({ logo: '', logo_dark: '' });
		expect(getLogoSrc('light', t)).toBe('/major.png');
		expect(getLogoSrc('dark', t)).toBe('/major.png');
	});

	it('cycles the error image by team_id', () => {
		const t0 = team({ team_id: 0, logo: '', logo_dark: '' });
		const t2 = team({ team_id: 2, logo: '', logo_dark: '' });
		expect(getLogoSrc('light', t0)).toBe('/aspen.png');
		expect(getLogoSrc('light', t2)).toBe('/mona.png');
	});

	it('rejects non-https URLs', () => {
		const t = team({ logo: 'http://a.espncdn.com/i/teamlogos/ncaa/500/x.png' });
		expect(getLogoSrc('light', t)).toBe('/major.png');
	});
});

describe('espnCombinerUrl', () => {
	it('builds a 64px cropped combiner URL', () => {
		expect(espnCombinerUrl('/i/teamlogos/ncaa/500/x.png', 64)).toBe(
			'https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/x.png&w=64&h=64&scale=crop&cquality=75&location=origin',
		);
	});
});
