import styles from '@components/teamName.module.css';
import { ERROR_IMAGES } from '@lib/constants';
import { Team } from '@lib/types';

function getTheme(): string {
	return (document.body.dataset.theme as string) || 'light';
}

function getImgSrc(mode: string, team: Team): string {
	const errImg = ERROR_IMAGES[team.team_id % 3];
	if (mode === 'dark') return team.logo_dark || errImg;
	return team.logo || errImg;
}

function espnLoader(src: string, width: number): string {
	return `https://a.espncdn.com/combiner/i?img=${src}&w=${width}&h=${width}&scale=crop&cquality=75&location=origin`;
}

function buildLogoImg(team: Team): HTMLImageElement {
	const mode = getTheme();
	const raw = getImgSrc(mode, team);
	const sliceIndex = raw.indexOf('/i/teamlogos/ncaa');
	const img = document.createElement('img');
	img.src = sliceIndex < 0 ? raw : espnLoader(raw.slice(sliceIndex), 64);
	img.alt = team.name;
	img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain';
	img.onerror = () => {
		img.src = '/pups.png';
	};
	return img;
}

export function renderTeamName(team: Team): HTMLElement {
	const container = document.createElement('div');
	container.className = styles.container;
	container.dataset.teamId = String(team.team_id);

	const logoDiv = document.createElement('div');
	logoDiv.className = styles.logo;
	logoDiv.appendChild(buildLogoImg(team));

	const nameDiv = document.createElement('div');
	nameDiv.className = styles.name;
	const span = document.createElement('span');
	span.textContent = team.name;
	nameDiv.appendChild(span);

	container.appendChild(logoDiv);
	container.appendChild(nameDiv);
	return container;
}

export function updateAllTeamLogos(root: HTMLElement, teams: Team[]) {
	const teamMap = new Map(teams.map((t) => [String(t.team_id), t]));
	const containers = root.querySelectorAll<HTMLElement>('[data-team-id]');
	containers.forEach((el) => {
		const team = teamMap.get(el.dataset.teamId!);
		if (!team) return;
		const logoDiv = el.querySelector(`.${styles.logo}`);
		if (!logoDiv) return;
		logoDiv.innerHTML = '';
		logoDiv.appendChild(buildLogoImg(team));
	});
}
