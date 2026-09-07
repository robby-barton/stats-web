/**
 * Allowlist of https hosts that DB-provided logo URLs (`team_names.logo` /
 * `logo_dark`) may point at. Mirrors the img-src list in public/_headers.
 * Any logo URL that does not parse to an allowlisted https host falls back to
 * the error images at the call sites.
 */
export const LOGO_HOSTS = ['a.espncdn.com'] as const;

export function isAllowedLogoUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'https:' && (LOGO_HOSTS as readonly string[]).includes(parsed.host);
	} catch {
		return false;
	}
}
