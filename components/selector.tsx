import { ChangeEvent } from 'react';

import styles from '@components/selector.module.css';
import { DIVISIONS } from '@lib/constants';
import { AvailRanks, YearRanks } from '@lib/types';

type DefaultValues = {
	division: string;
	year: string;
	week: string;
};

type DivisionProps = {
	options: string[];
	initials: DefaultValues;
};
function DivisionDropdown({ options, initials }: DivisionProps) {
	const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		window.location.href = `/ranking/${e.target.value}/${initials.year}/${initials.week}`;
	};

	return (
		<select
			title="division"
			className={styles.divisionDropdown}
			value={initials.division.toLowerCase()}
			onChange={handleChange}
		>
			{options.map((option) => (
				<option key={option} value={option.toLowerCase()}>
					{option.toUpperCase()}
				</option>
			))}
		</select>
	);
}

type YearProps = {
	options: string[];
	initials: DefaultValues;
	availRanks: AvailRanks;
};
function YearDropdown({ options, initials, availRanks }: YearProps) {
	const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		if (!availRanks[initials.year].postseason && initials.week == availRanks[initials.year].weeks.toString()) {
			window.location.href = `/ranking/${initials.division}/${e.target.value}/final`;
		} else {
			window.location.href = `/ranking/${initials.division}/${e.target.value}/${initials.week}`;
		}
	};

	return (
		<select title="year" className={styles.yearDropdown} value={initials.year} onChange={handleChange}>
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}

type WeekProps = {
	options: YearRanks;
	initials: DefaultValues;
};
function WeekDropdown({ options, initials }: WeekProps) {
	const optionList = [];
	for (let i = 1; i <= options.weeks; i++) {
		optionList.push({ value: i.toString(), text: 'Week ' + i });
	}
	if (options.postseason) {
		optionList.push({ value: 'final', text: 'Final' });
	}

	const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		window.location.href = `/ranking/${initials.division}/${initials.year}/${e.target.value}`;
	};

	return (
		<select title="week" className={styles.weekDropdown} value={initials.week} onChange={handleChange}>
			{optionList.map((option) => (
				<option key={option.value} value={option.value}>
					{option.text}
				</option>
			))}
		</select>
	);
}

type SelectorProps = {
	availRanks: AvailRanks;
	division: string;
	year: number;
	week: string;
};
export default function Selector({ availRanks, division, year, week }: SelectorProps) {
	const years: string[] = [];
	for (const key in availRanks) {
		years.push(key);
	}
	years.sort().reverse();
	const initials = {
		division: division.toLowerCase(),
		year: year.toString(),
		week: week.toLowerCase(),
	};
	return (
		<div className={styles.selectorStyling}>
			<DivisionDropdown options={DIVISIONS} initials={initials} />
			<YearDropdown options={years} initials={initials} availRanks={availRanks} />
			<WeekDropdown options={availRanks[year]} initials={initials} />
		</div>
	);
}
