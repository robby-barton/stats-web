import { useContext } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import TeamName from '@components/teamName';
import { ThemeContext, ThemeProvider } from '@components/themeProvider';
import { ERROR_IMAGES } from '@lib/constants';
import { Team } from '@lib/types';

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
	const { setColorMode } = useContext(ThemeContext);

	return (
		<div>
			<button onClick={() => setColorMode('dark')} aria-label="dark">
				Dark Mode
			</button>
			<TeamName team={team} />
		</div>
	);
}

describe('TeamName', () => {
	it('errors to correct img', async () => {
		render(
			<ThemeProvider>
				<TeamName team={scInfo} />
			</ThemeProvider>,
		);
		const img = (await screen.findByAltText('South Carolina')) as HTMLImageElement;

		fireEvent.error(img);

		expect(img.src).toContain('pups.png');
	});

	it('changes to dark', async () => {
		render(
			<ThemeProvider>
				<TestTeamName team={scInfo} />
			</ThemeProvider>,
		);
		const img = (await screen.findByAltText('South Carolina')) as HTMLImageElement;

		expect(img.src).not.toContain('dark');

		fireEvent.click(screen.getByRole('button', { name: 'dark' }));

		expect(img.src).toContain('dark');

		fireEvent.error(img);

		expect(img.src).toContain('pups.png');
	});

	it('can start dark', async () => {
		document.body.dataset.theme = 'dark';
		render(
			<ThemeProvider>
				<TeamName team={scInfo} />
			</ThemeProvider>,
		);
		const img = (await screen.findByAltText('South Carolina')) as HTMLImageElement;

		expect(img.src).toContain('dark');
	});

	it('can start dark as pup', async () => {
		document.body.dataset.theme = 'dark';
		const team_id = 2579;
		render(
			<ThemeProvider>
				<TeamName
					team={{
						team_id: team_id,
						name: 'South Carolina',
						logo: '',
						logo_dark: '',
					}}
				/>
			</ThemeProvider>,
		);
		const img = (await screen.findByAltText('South Carolina')) as HTMLImageElement;

		expect(img.src).toContain(ERROR_IMAGES[team_id % 3].replace('/', ''));
	});
});
