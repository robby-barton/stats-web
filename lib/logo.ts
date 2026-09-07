import { ERROR_IMAGES } from '@lib/constants';
import { isAllowedLogoUrl } from '@lib/logoHosts';
import { Team } from '@lib/types';

/**
 * Shared logo-selection logic for DB-provided team logos. URLs that are empty
 * or not https-allowlisted (see lib/logoHosts.ts) fall back to the error
 * images, mirroring the img-src list in public/_headers.
 */
function fallbackImage(team: Team): string {
	return ERROR_IMAGES[team.team_id % 3];
}

/** ESPN image-combiner URL that crops a team logo to `width` px. */
export function espnCombinerUrl(src: string, width: number): string {
	return `https://a.espncdn.com/combiner/i?img=${src}&w=${width}&h=${width}&scale=crop&cquality=75&location=origin`;
}

/**
 * Resolves the `img.src` for a team logo under the given theme mode
 * ('light' | 'dark'): picks logo vs logo_dark, enforces the host allowlist,
 * and routes ESPN team logos through the combiner cropped to 64px.
 */
export function getLogoSrc(mode: string, team: Team): string {
	const candidate = mode === 'dark' ? team.logo_dark : team.logo;
	if (!candidate || !isAllowedLogoUrl(candidate)) return fallbackImage(team);
	const sliceIndex = candidate.indexOf('/i/teamlogos/ncaa');
	return sliceIndex < 0 ? candidate : espnCombinerUrl(candidate.slice(sliceIndex), 64);
}
