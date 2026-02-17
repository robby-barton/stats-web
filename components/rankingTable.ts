import { renderTeamName, updateAllTeamLogos } from '@components/teamNameRenderer';
import tableStyles from '@components/rankingTable.module.css';
import { SortState, comparator, nextSort } from '@lib/tableSort';
import { Rank } from '@lib/types';

type Column = {
	key: string;
	header: string;
	sortable: boolean;
	sortDescFirst: boolean;
	format?: (val: unknown) => string;
	sortValue?: (row: Rank) => string | number;
	renderCell?: (row: Rank) => HTMLElement;
	isLast?: boolean;
};

const COLUMNS: Column[] = [
	{ key: 'final_rank', header: 'Rank', sortable: true, sortDescFirst: false },
	{
		key: 'team',
		header: 'Team',
		sortable: true,
		sortDescFirst: false,
		sortValue: (row: Rank) => row.team.name,
		renderCell: (row: Rank) => renderTeamName(row.team),
	},
	{ key: 'conf', header: 'Conf', sortable: true, sortDescFirst: true },
	{ key: 'record', header: 'Record', sortable: false, sortDescFirst: false },
	{ key: 'srs_rank', header: 'SRS', sortable: true, sortDescFirst: false },
	{ key: 'sos_rank', header: 'SOS', sortable: true, sortDescFirst: false },
	{
		key: 'final_raw',
		header: 'Final',
		sortable: true,
		sortDescFirst: true,
		format: (val) => (val as number).toFixed(5),
		isLast: true,
	},
];

export function createRankingTable(initialRows: Rank[], sport: string) {
	let rows = initialRows;
	let sort: SortState = { col: null, dir: null };

	const table = document.createElement('table');
	const thead = document.createElement('thead');
	const headerRow = document.createElement('tr');
	const tbody = document.createElement('tbody');

	const headerDivs: Map<string, HTMLDivElement> = new Map();

	for (const col of COLUMNS) {
		const th = document.createElement('th');
		if (col.isLast) th.className = tableStyles.lastColumn;
		const div = document.createElement('div');
		if (col.sortable) {
			div.className = 'cursor-pointer select-none';
			div.addEventListener('click', () => {
				sort = nextSort(sort, col.key, col.sortDescFirst);
				updateHeaders();
				renderBody();
			});
		}
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

	function getSortedRows(): Rank[] {
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
			tr.style.cursor = 'pointer';
			tr.addEventListener('click', () => {
				window.location.href = `/team/${row.team.team_id}${sport ? `#${sport}` : ''}`;
			});
			for (const col of COLUMNS) {
				const td = document.createElement('td');
				if (col.isLast) td.className = tableStyles.lastColumn;
				if (col.renderCell) {
					td.appendChild(col.renderCell(row));
				} else {
					const val = (row as unknown as Record<string, unknown>)[col.key];
					td.textContent = col.format ? col.format(val) : String(val);
				}
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
	}

	renderBody();

	function update(newRows: Rank[]) {
		rows = newRows;
		renderBody();
	}

	function refreshLogos() {
		const allTeams = rows.map((r) => r.team);
		updateAllTeamLogos(tbody, allTeams);
	}

	return { element: table, update, refreshLogos };
}
