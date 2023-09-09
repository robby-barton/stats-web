import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import Games from '@components/games';
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

describe('Games', () => {
	it('team search works', () => {
		const games: TeamGames[] = [
			{
				team: scInfo,
				sun: 1,
				mon: 2,
				tue: 3,
				wed: 4,
				thu: 5,
				fri: 6,
				sat: 7,
				total: 10,
			},
			{
				team: fsuInfo,
				sun: 7,
				mon: 6,
				tue: 5,
				wed: 4,
				thu: 3,
				fri: 2,
				sat: 1,
				total: 10,
			},
		];
		render(
			<ThemeProvider>
				<Games games={games} />
			</ThemeProvider>,
		);

		const team = screen.getByText('South Carolina');
		expect(team).toBeInTheDocument();

		fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'FSU' } });
		expect(team).not.toBeInTheDocument();
	});
});
