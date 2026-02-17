import styles from '@components/games.module.css';
import { createGameTable } from '@components/gameTable';
import { TeamGames } from '@lib/types';
import commonStyles from '@styles/common.module.css';

export function initGames(root: HTMLElement, games: TeamGames[]) {
	const wrapper = document.createElement('div');

	const inputArea = document.createElement('div');
	inputArea.className = commonStyles.inputArea;

	const searchDiv = document.createElement('div');
	searchDiv.className = styles.searchDiv;
	const searchInput = document.createElement('input');
	searchInput.className = styles.searchInput;
	searchInput.type = 'search';
	searchInput.placeholder = 'Search Teams';
	searchDiv.appendChild(searchInput);
	inputArea.appendChild(searchDiv);

	wrapper.appendChild(inputArea);

	const table = createGameTable(games);
	wrapper.appendChild(table.element);

	searchInput.addEventListener('input', () => {
		const q = searchInput.value.toLowerCase();
		const filtered = games.filter((g) => g.team.name.toLowerCase().includes(q));
		table.update(filtered);
	});

	window.addEventListener('theme-change', () => {
		table.refreshLogos();
	});

	root.appendChild(wrapper);
}
