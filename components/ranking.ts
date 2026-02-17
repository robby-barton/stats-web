import styles from '@components/ranking.module.css';
import { createRankingTable } from '@components/rankingTable';
import { renderSelector } from '@components/selector';
import { AvailRanks, Rank } from '@lib/types';

type RankingProps = {
	availRanks: AvailRanks;
	ranking: Rank[];
	division: string;
	year: number;
	week: string;
	sport: string;
};

export function initRanking(root: HTMLElement, props: RankingProps) {
	const { availRanks, ranking, division, year, week, sport } = props;

	const wrapper = document.createElement('div');

	// Input area: selector + search
	const inputArea = document.createElement('div');
	inputArea.className = styles.inputArea;

	inputArea.appendChild(renderSelector({ availRanks, division, year, week, sport }));

	const searchDiv = document.createElement('div');
	searchDiv.className = styles.searchDiv;
	const searchInput = document.createElement('input');
	searchInput.type = 'search';
	searchInput.className = styles.searchInput;
	searchInput.placeholder = 'Search Teams';
	searchDiv.appendChild(searchInput);
	inputArea.appendChild(searchDiv);

	wrapper.appendChild(inputArea);

	// Table
	const table = createRankingTable(ranking, sport);
	wrapper.appendChild(table.element);

	searchInput.addEventListener('input', () => {
		const q = searchInput.value.toLowerCase();
		const filtered = ranking.filter(
			(r) => r.team.name.toLowerCase().includes(q) || r.conf.toLowerCase().includes(q),
		);
		table.update(filtered);
	});

	window.addEventListener('theme-change', () => {
		table.refreshLogos();
	});

	root.appendChild(wrapper);
}
