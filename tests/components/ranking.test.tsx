import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import Ranking from '@components/ranking';
import { ThemeProvider } from '@components/themeProvider';
import { AvailRanks, Rank, Team } from '@lib/types';

jest.mock('next/router', () => ({
	useRouter: jest.fn(),
}));

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

describe('Ranking', () => {
	it('team search works', async () => {
		const avail: AvailRanks = {
			'2022': {
				weeks: 16,
				postseason: true,
			},
		};
		const ranks: Rank[] = [
			{
				team: scInfo,
				conf: 'SEC',
				final_raw: 0.1234567,
				final_rank: 1,
				sos_rank: 1,
				srs_rank: 1,
				record: 'record',
			},
			{
				team: fsuInfo,
				conf: 'ACC',
				final_rank: 2,
				final_raw: 0.01234566,
				sos_rank: 2,
				srs_rank: 2,
				record: 'record',
			},
		];
		render(
			<ThemeProvider>
				<Ranking availRanks={avail} ranking={ranks} division="fbs" year={2022} week="Final" />
			</ThemeProvider>,
		);

		const team = screen.getByText('South Carolina');
		expect(team).toBeInTheDocument();

		fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'FSU' } });
		expect(team).not.toBeInTheDocument();
	});
});
