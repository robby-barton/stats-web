import { render } from '@testing-library/react';

import '@testing-library/jest-dom';
import { REVALIDATE } from '@lib/constants';
import { Team } from '@lib/types';
import { getRankedTeams } from '@lib/utils';
import Teams, { getStaticProps } from '@pages/teams';

jest.mock('@lib/utils', () => ({
	__esModule: true,
	getRankedTeams: jest.fn(),
}));

afterAll(() => {
	jest.unmock('@lib/utils');
});

afterEach(() => {
	jest.clearAllMocks();
});

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

describe('Teams page', () => {
	it('renders correctly', async () => {
		const teams: Team[] = [scInfo, fsuInfo];
		const { baseElement } = render(<Teams teams={teams} />);

		expect(baseElement).toMatchSnapshot();
	});

	it('getStaticProps returns correctly', async () => {
		const teams: Team[] = [scInfo, fsuInfo, scInfo];
		(getRankedTeams as jest.Mock).mockReturnValue(teams);

		const expected = {
			props: {
				teams: [fsuInfo, scInfo, scInfo],
			},
			revalidate: REVALIDATE,
		};

		const result = await getStaticProps();

		expect(result).toEqual(expected);

		expect(getRankedTeams).toBeCalledTimes(1);
	});
});
