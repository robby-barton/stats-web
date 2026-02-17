import { updateAllTeamLogos } from '@components/teamNameRenderer';
import { renderTeamList } from '@components/teamList';
import styles from '@components/teamSearch.module.css';
import { Team } from '@lib/types';

export function initTeamSearch(root: HTMLElement, teams: Team[]) {
	const wrapper = document.createElement('div');

	const inputWrapper = document.createElement('div');
	const searchInput = document.createElement('input');
	searchInput.className = styles.teamSearch;
	searchInput.type = 'search';
	searchInput.placeholder = 'Search Teams';
	inputWrapper.appendChild(searchInput);
	wrapper.appendChild(inputWrapper);

	const listContainer = document.createElement('div');
	wrapper.appendChild(listContainer);

	renderTeamList(listContainer, teams);

	searchInput.addEventListener('input', () => {
		const q = searchInput.value.toLowerCase();
		const filtered = teams.filter((t) => t.name.toLowerCase().includes(q));
		renderTeamList(listContainer, filtered);
	});

	window.addEventListener('theme-change', () => {
		updateAllTeamLogos(listContainer, teams);
	});

	root.appendChild(wrapper);
}
