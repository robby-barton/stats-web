import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import GameTable from '@components/gameTable';
import { ThemeProvider } from '@components/themeProvider';
import { Team, TeamGames } from '@lib/types';

beforeEach(() => {
	document.body.dataset.theme = 'light';

	const mockIntersectionObserver = jest.fn();
	mockIntersectionObserver.mockReturnValue({
		observe: () => null,
		unobserve: () => null,
		disconnect: () => null,
	});
	window.IntersectionObserver = mockIntersectionObserver;
});

const scInfo: Team = {
	team_id: 2579,
	name: 'South Carolina',
	logo: '/logo/south-carolina.png',
	logo_dark: '/logo-dark/south-carolina.png',
};

const fsuInfo: Team = {
	team_id: 52,
	name: 'Florida State',
	logo: '/logo/florida-state.png',
	logo_dark: '/logo-dark/florida-state.png',
};

const gameCounts = {
	sun: 1,
	mon: 1,
	tue: 1,
	wed: 1,
	thu: 1,
	fri: 1,
	sat: 1,
	total: 1,
};

describe('Game Table', () => {
	it('sorts', () => {
		const ranks: TeamGames[] = [
			{
				team: scInfo,
				...gameCounts,
			},
			{
				team: fsuInfo,
				...gameCounts,
			},
			{
				team: {
					team_id: 1234,
					name: 'South Carolina',
					logo: '',
					logo_dark: '',
				},
				...gameCounts,
			},
		];

		render(
			<ThemeProvider>
				<GameTable teams={ranks} />
			</ThemeProvider>,
		);
		const [first, second] = screen.getAllByText(/south carolina/i);
		const fsu = screen.getByText(/florida state/i);

		expect(first.compareDocumentPosition(fsu)).toBe(4);
		expect(second.compareDocumentPosition(fsu)).toBe(2);
		fireEvent.click(screen.getByText(/team/i));
		expect(first.compareDocumentPosition(fsu)).toBe(2);
		expect(second.compareDocumentPosition(fsu)).toBe(2);
		fireEvent.click(screen.getByText(/team/i));
		expect(first.compareDocumentPosition(fsu)).toBe(4);
		expect(second.compareDocumentPosition(fsu)).toBe(4);
	});
});
