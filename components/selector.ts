import styles from '@components/selector.module.css';
import { SPORTS } from '@lib/constants';
import { AvailRanks } from '@lib/types';

type SelectorProps = {
	availRanks: AvailRanks;
	division: string;
	year: number;
	week: string;
	sport: string;
};

export function renderSelector({ availRanks, division, year, week, sport }: SelectorProps): HTMLElement {
	const initials = {
		sport,
		division: division.toLowerCase(),
		year: year.toString(),
		week: week.toLowerCase(),
	};

	const wrapper = document.createElement('div');
	wrapper.className = styles.selectorStyling;

	const divisions = SPORTS[sport].divisions;
	if (divisions.length > 1) {
		const divSelect = document.createElement('select');
		divSelect.title = 'division';
		divSelect.className = styles.divisionDropdown;
		divSelect.value = initials.division;
		for (const opt of divisions) {
			const o = document.createElement('option');
			o.value = opt.toLowerCase();
			o.textContent = opt.toUpperCase();
			divSelect.appendChild(o);
		}
		divSelect.value = initials.division;
		divSelect.addEventListener('change', () => {
			window.location.href = `/${initials.sport}/ranking/${divSelect.value}/${initials.year}/${initials.week}`;
		});
		wrapper.appendChild(divSelect);
	}

	// Year dropdown
	const years = Object.keys(availRanks).sort().reverse();
	const yearSelect = document.createElement('select');
	yearSelect.title = 'year';
	yearSelect.className = styles.yearDropdown;
	for (const y of years) {
		const o = document.createElement('option');
		o.value = y;
		o.textContent = y;
		yearSelect.appendChild(o);
	}
	yearSelect.value = initials.year;
	yearSelect.addEventListener('change', () => {
		if (!availRanks[initials.year].postseason && initials.week == availRanks[initials.year].weeks.toString()) {
			window.location.href = `/${initials.sport}/ranking/${initials.division}/${yearSelect.value}/final`;
		} else {
			window.location.href = `/${initials.sport}/ranking/${initials.division}/${yearSelect.value}/${initials.week}`;
		}
	});
	wrapper.appendChild(yearSelect);

	// Week dropdown
	const yearRanks = availRanks[year];
	const weekSelect = document.createElement('select');
	weekSelect.title = 'week';
	weekSelect.className = styles.weekDropdown;
	for (let i = 1; i <= yearRanks.weeks; i++) {
		const o = document.createElement('option');
		o.value = i.toString();
		o.textContent = 'Week ' + i;
		weekSelect.appendChild(o);
	}
	if (yearRanks.postseason) {
		const o = document.createElement('option');
		o.value = 'final';
		o.textContent = 'Final';
		weekSelect.appendChild(o);
	}
	weekSelect.value = initials.week;
	weekSelect.addEventListener('change', () => {
		window.location.href = `/${initials.sport}/ranking/${initials.division}/${initials.year}/${weekSelect.value}`;
	});
	wrapper.appendChild(weekSelect);

	return wrapper;
}
