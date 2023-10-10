import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import '@testing-library/jest-dom';

import Selector from '@components/selector';
import { AvailRanks } from '@lib/types';

jest.mock('next/router', () => ({
	__esModule: true,
	useRouter: jest.fn(),
}));
const mockRouter = {
	push: jest.fn(),
};
(useRouter as jest.Mock).mockReturnValue(mockRouter);

const avail: AvailRanks = {
	'2021': {
		weeks: 16,
		postseason: true,
	},
	'2022': {
		weeks: 16,
		postseason: true,
	},
	'2023': {
		weeks: 7,
		postseason: false,
	},
};

const division = 'fbs';
const year = 2022;
const week = 'final';

describe('Selector', () => {
	it('division dropdown works', () => {
		render(<Selector availRanks={avail} division={division} year={year} week={week} />);

		const newValue = 'fcs';
		fireEvent.change(screen.getByTitle('division'), { target: { value: newValue } });
		expect(mockRouter.push).toHaveBeenCalledWith(`/ranking/${newValue}/${year}/${week}`);
	});

	it('year dropdown works', () => {
		render(<Selector availRanks={avail} division={division} year={year} week={week} />);

		const newValue = '2021';
		fireEvent.change(screen.getByTitle('year'), { target: { value: newValue } });
		expect(mockRouter.push).toHaveBeenCalledWith(`/ranking/${division}/${newValue}/${week}`);
	});

	it('year dropdown works, current->final', () => {
		render(<Selector availRanks={avail} division={division} year={2023} week={'7'} />);

		const newValue = '2021';
		fireEvent.change(screen.getByTitle('year'), { target: { value: newValue } });
		expect(mockRouter.push).toHaveBeenCalledWith(`/ranking/${division}/${newValue}/final`);
	});

	it('week dropdown works', () => {
		render(<Selector availRanks={avail} division={division} year={year} week={week} />);

		const newValue = '4';
		fireEvent.change(screen.getByTitle('week'), { target: { value: newValue } });
		expect(mockRouter.push).toHaveBeenCalledWith(`/ranking/${division}/${year}/${newValue}`);
	});
});
