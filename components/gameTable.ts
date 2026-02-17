import { renderTeamName, updateAllTeamLogos } from '@components/teamNameRenderer';
import { SortState, comparator, nextSort } from '@lib/tableSort';
import { TeamGames } from '@lib/types';

type Column = {
	key: string;
	header: string;
	sortDescFirst: boolean;
	sortValue?: (row: TeamGames) => string | number;
	renderCell?: (row: TeamGames) => HTMLElement;
};

const COLUMNS: Column[] = [
	{
		key: 'team',
		header: 'Team',
		sortDescFirst: false,
		sortValue: (row: TeamGames) => row.team.name,
		renderCell: (row: TeamGames) => renderTeamName(row.team),
	},
	{ key: 'sun', header: 'Sun', sortDescFirst: true },
	{ key: 'mon', header: 'Mon', sortDescFirst: true },
	{ key: 'tue', header: 'Tue', sortDescFirst: true },
	{ key: 'wed', header: 'Wed', sortDescFirst: true },
	{ key: 'thu', header: 'Thu', sortDescFirst: true },
	{ key: 'fri', header: 'Fri', sortDescFirst: true },
	{ key: 'sat', header: 'Sat', sortDescFirst: true },
	{ key: 'total', header: 'Total', sortDescFirst: true },
];

export function createGameTable(initialRows: TeamGames[]) {
	let rows = initialRows;
	let sort: SortState = { col: null, dir: null };

	const table = document.createElement('table');
	const thead = document.createElement('thead');
	const headerRow = document.createElement('tr');
	const tbody = document.createElement('tbody');

	const headerDivs: Map<string, HTMLDivElement> = new Map();

	for (const col of COLUMNS) {
		const th = document.createElement('th');
		const div = document.createElement('div');
		div.addEventListener('click', () => {
			sort = nextSort(sort, col.key, col.sortDescFirst);
			updateHeaders();
			renderBody();
		});
		div.textContent = col.header;
		headerDivs.set(col.key, div);
		th.appendChild(div);
		headerRow.appendChild(th);
	}
	thead.appendChild(headerRow);
	table.appendChild(thead);
	table.appendChild(tbody);

	function updateHeaders() {
		for (const col of COLUMNS) {
			const div = headerDivs.get(col.key)!;
			let text = col.header;
			if (sort.col === col.key && sort.dir) {
				text += sort.dir === 'asc' ? '\u2191' : '\u2193';
			}
			div.textContent = text;
		}
	}

	function getSortedRows(): TeamGames[] {
		if (!sort.col || !sort.dir) return rows;
		const col = COLUMNS.find((c) => c.key === sort.col)!;
		const dir = sort.dir;
		return [...rows].sort((a, b) => {
			const va = col.sortValue ? col.sortValue(a) : (a as unknown as Record<string, unknown>)[col.key];
			const vb = col.sortValue ? col.sortValue(b) : (b as unknown as Record<string, unknown>)[col.key];
			return comparator(va as string | number, vb as string | number, dir);
		});
	}

	function renderBody() {
		tbody.innerHTML = '';
		const sorted = getSortedRows();
		for (const row of sorted) {
			const tr = document.createElement('tr');
			for (const col of COLUMNS) {
				const td = document.createElement('td');
				if (col.renderCell) {
					td.appendChild(col.renderCell(row));
				} else {
					td.textContent = String((row as unknown as Record<string, unknown>)[col.key]);
				}
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
	}

	renderBody();

	function update(newRows: TeamGames[]) {
		rows = newRows;
		renderBody();
	}

	function refreshLogos() {
		const allTeams = rows.map((r) => r.team);
		updateAllTeamLogos(tbody, allTeams);
	}

	return { element: table, update, refreshLogos };
}
