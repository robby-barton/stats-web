export type SortState = {
	col: string | null;
	dir: 'asc' | 'desc' | null;
};

export function nextSort(state: SortState, col: string, defaultDesc: boolean): SortState {
	if (state.col !== col) {
		return { col, dir: defaultDesc ? 'desc' : 'asc' };
	}
	if (state.dir === 'asc') {
		return defaultDesc ? { col: null, dir: null } : { col, dir: 'desc' };
	}
	if (state.dir === 'desc') {
		return defaultDesc ? { col, dir: 'asc' } : { col: null, dir: null };
	}
	return { col, dir: defaultDesc ? 'desc' : 'asc' };
}

export function comparator<T>(a: T, b: T, dir: 'asc' | 'desc'): number {
	const result = a > b ? 1 : a < b ? -1 : 0;
	return dir === 'desc' ? -result : result;
}
