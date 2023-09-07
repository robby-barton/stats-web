import ThemeToggle from '@components/themeToggle';
import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

beforeEach(() => {
	document.body.dataset.theme = 'light';
});

describe('TeamName', () => {
	it('changes theme', () => {
		render(<ThemeToggle />);
		const themeToggle = screen.getByRole('button');

		fireEvent.click(themeToggle);
		expect(document.body.dataset.theme).toEqual('dark');
	});
});
