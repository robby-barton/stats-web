import { createChart } from '@lib/teamChart';
import { SportTeamData, Team } from '@lib/types';
import { getLogoSrc } from '@lib/logo';

import { getIslandProps } from './island-utils';

// --- Theme helpers ---

function getTheme(): string {
	return (document.body.dataset.theme as string) || 'light';
}

// --- Team name / logo ---

function updateLogo(img: HTMLImageElement, team: Team) {
	img.src = getLogoSrc(getTheme(), team);
	img.onerror = () => {
		img.src = '/pups.png';
	};
}

// --- Init ---

type TeamData = {
	team: Team;
	sports: Record<string, SportTeamData>;
};

function initTeam(root: HTMLElement, { team, sports }: TeamData) {
	const sportKeys = Object.keys(sports);
	if (!sportKeys.length) return;

	// Logo
	const logoImg = root.querySelector<HTMLImageElement>('#team-logo');
	if (logoImg) {
		updateLogo(logoImg, team);
	}

	// Tabs
	const hashSport = window.location.hash.replace('#', '');
	let activeTab = sportKeys.includes(hashSport) ? hashSport : sportKeys[0];

	// Chart
	const chartEl = root.querySelector<HTMLElement>('#chartDiv');
	if (!chartEl) return;

	const chart = createChart(chartEl, sports[activeTab], getTheme());

	// Tab click handlers
	const tabButtons = root.querySelectorAll<HTMLButtonElement>('[data-sport-tab]');
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

const island = getIslandProps<TeamData>('team');

if (island) {
	initTeam(island.root, island.props);
}
