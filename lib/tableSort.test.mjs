import { describe, expect, it } from 'vitest';

import { comparator, nextSort } from './tableSort';

describe('nextSort', () => {
	it('starts ascending on a new column when the column sorts ascending by default', () => {
		expect(nextSort({ col: null, dir: null }, 'rank', false)).toEqual({ col: 'rank', dir: 'asc' });
	});

	it('starts descending on a new column when the column sorts descending by default', () => {
		expect(nextSort({ col: null, dir: null }, 'srs', true)).toEqual({ col: 'srs', dir: 'desc' });
	});

	it('toggles asc -> desc -> cleared for a default-ascending column', () => {
		expect(nextSort({ col: 'rank', dir: 'asc' }, 'rank', false)).toEqual({ col: 'rank', dir: 'desc' });
		expect(nextSort({ col: 'rank', dir: 'desc' }, 'rank', false)).toEqual({ col: null, dir: null });
	});

	it('toggles desc -> asc -> cleared for a default-descending column', () => {
		expect(nextSort({ col: 'srs', dir: 'desc' }, 'srs', true)).toEqual({ col: 'srs', dir: 'asc' });
		expect(nextSort({ col: 'srs', dir: 'asc' }, 'srs', true)).toEqual({ col: null, dir: null });
	});

	it('switching columns restarts the cycle at the column default', () => {
		expect(nextSort({ col: 'rank', dir: 'asc' }, 'srs', true)).toEqual({ col: 'srs', dir: 'desc' });
		expect(nextSort({ col: 'srs', dir: 'desc' }, 'rank', false)).toEqual({ col: 'rank', dir: 'asc' });
	});

	it('falls back to the column default from the cleared state', () => {
		expect(nextSort({ col: null, dir: null }, 'srs', true)).toEqual({ col: 'srs', dir: 'desc' });
	});
});

describe('comparator', () => {
	it('compares numbers ascending', () => {
		expect(comparator(1, 2, 'asc')).toBeLessThan(0);
		expect(comparator(2, 1, 'asc')).toBeGreaterThan(0);
		expect(comparator(2, 2, 'asc')).toBe(0);
	});

	it('reverses the order for descending', () => {
		expect(comparator(1, 2, 'desc')).toBeGreaterThan(0);
		expect(comparator(2, 1, 'desc')).toBeLessThan(0);
		expect(comparator(2, 2, 'desc')).toBe(0);
	});

	it('sorts an array of numbers both directions', () => {
		const values = [3, 1, 2];
		expect([...values].sort((a, b) => comparator(a, b, 'asc'))).toEqual([1, 2, 3]);
		expect([...values].sort((a, b) => comparator(a, b, 'desc'))).toEqual([3, 2, 1]);
	});

	it('compares strings lexicographically', () => {
		expect(comparator('a', 'b', 'asc')).toBeLessThan(0);
		expect(comparator('b', 'a', 'desc')).toBeLessThan(0);
	});
});
