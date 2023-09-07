import TeamName from '@components/teamName';
import { ERROR_IMAGES } from '@lib/constants';
import { Team } from '@lib/types';
import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

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
	logo: '/i/teamlogos/ncaa/south-carolina.png',
	logo_dark: '/logo-dark/south-carolina.png',
};

function TestTeamName({ team }: { team: Team }) {
	return (
		<div>
			<button aria-label="dark">Dark Mode</button>
			<TeamName team={team} />
		</div>
	);
}

describe('TeamName', () => {
	it('errors to correct img', async () => {
		render(<TeamName team={scInfo} />);
		const img = (await screen.findByAltText('South Carolina')) as HTMLImageElement;

		fireEvent.error(img);

		expect(img.src).toContain('pups.png');
	});

	it('changes to dark', async () => {
		render(<TestTeamName team={scInfo} />);
		const img = (await screen.findByAltText('South Carolina')) as HTMLImageElement;

		expect(img.src).not.toContain('dark');

		fireEvent.click(screen.getByRole('button', { name: 'dark' }));

		expect(img.src).toContain('dark');

		fireEvent.error(img);

		expect(img.src).toContain('pups.png');
	});

	it('can start dark', async () => {
		document.body.dataset.theme = 'dark';
		render(<TeamName team={scInfo} />);
		const img = (await screen.findByAltText('South Carolina')) as HTMLImageElement;

		expect(img.src).toContain('dark');
	});

	it('can start dark as pup', async () => {
		document.body.dataset.theme = 'dark';
		const team_id = 2579;
		render(
			<TeamName
				team={{
					team_id: team_id,
					name: 'South Carolina',
					logo: '',
					logo_dark: '',
				}}
			/>,
		);
		const img = (await screen.findByAltText('South Carolina')) as HTMLImageElement;

		expect(img.src).toContain(ERROR_IMAGES[team_id % 3].replace('/', ''));
	});
});
