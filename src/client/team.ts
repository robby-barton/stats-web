import { createChart } from '@lib/teamChart';
import { SportTeamData, Team } from '@lib/types';
import { ERROR_IMAGES } from '@lib/constants';

// --- Theme helpers ---

function getTheme(): string {
	return (document.body.dataset.theme as string) || 'light';
}

// --- Team name / logo ---

function getImgSrc(mode: string, team: Team): string {
	const errImg = ERROR_IMAGES[team.team_id % 3];
	if (mode === 'dark') return team.logo_dark || errImg;
	return team.logo || errImg;
}

function espnLoader(src: string, width: number): string {
	return `https://a.espncdn.com/combiner/i?img=${src}&w=${width}&h=${width}&scale=crop&cquality=75&location=origin`;
}

function updateLogo(img: HTMLImageElement, team: Team) {
	const mode = getTheme();
	const src = getImgSrc(mode, team);
	const sliceIndex = src.indexOf('/i/teamlogos/ncaa');
	img.src = sliceIndex < 0 ? src : espnLoader(src.slice(sliceIndex), 64);
	img.onerror = () => {
		img.src = '/pups.png';
	};
}

// --- Init ---

type TeamData = {
	team: Team;
	sports: Record<string, SportTeamData>;
};

function init() {
	const propsNode = document.getElementById('team-data');
	if (!propsNode?.textContent) return;

	const { team, sports }: TeamData = JSON.parse(propsNode.textContent);
	const sportKeys = Object.keys(sports);
	if (!sportKeys.length) return;

	// Logo
	const logoImg = document.getElementById('team-logo') as HTMLImageElement | null;
	if (logoImg) {
		updateLogo(logoImg, team);
	}

	// Tabs
	const hashSport = window.location.hash.replace('#', '');
	let activeTab = sportKeys.includes(hashSport) ? hashSport : sportKeys[0];

	// Chart
	const chartEl = document.getElementById('chartDiv');
	if (!chartEl) return;

	const chart = createChart(chartEl, sports[activeTab], getTheme());

	// Tab click handlers
	const tabButtons = document.querySelectorAll<HTMLButtonElement>('[data-sport-tab]');
	function setActiveTabUI(key: string) {
		tabButtons.forEach((btn) => {
			btn.classList.toggle('tabActive', btn.dataset.sportTab === key);
		});
	}
	setActiveTabUI(activeTab);

	tabButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const key = btn.dataset.sportTab!;
			if (key === activeTab) return;
			activeTab = key;
			setActiveTabUI(key);
			chart.setData(sports[key]);
		});
	});

	// Theme changes
	window.addEventListener('theme-change', () => {
		chart.setTheme(getTheme());
		if (logoImg) updateLogo(logoImg, team);
	});
}

init();
