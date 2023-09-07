import { useRouter } from 'next/router';

import RankingTable from '@components/rankingTable';
import { Rank, Team } from '@lib/types';
import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

jest.mock('next/router', () => ({
	__esModule: true,
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

const stats = {
	final_raw: 0.1234567,
	final_rank: 1,
	sos_rank: 1,
	srs_rank: 1,
	record: 'record',
};

describe('Ranking Table', () => {
	it('link to team works', () => {
		const mockRouter = {
			push: jest.fn(),
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
		];
		(useRouter as jest.Mock).mockReturnValue(mockRouter);

		render(<RankingTable teams={ranks} />);

		fireEvent.click(screen.getByText('South Carolina'));
		expect(mockRouter.push).toHaveBeenCalledWith(`/team/${ranks[0].team.team_id}`);
	});

	it('sorts', () => {
		const ranks: Rank[] = [
			{
				team: scInfo,
				conf: 'SEC',
				...stats,
			},
			{
				team: fsuInfo,
				conf: 'ACC',
				...stats,
			},
			{
				team: {
					team_id: 1234,
					name: 'South Carolina',
					logo: '',
					logo_dark: '',
				},
				conf: 'SEC',
				...stats,
			},
		];

		render(<RankingTable teams={ranks} />);
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
