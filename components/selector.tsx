import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";

import styles from "@components/selector.module.css";
import { DIVISIONS } from "@lib/constants";
import { AvailRanks, YearRanks } from "@lib/types";

let currDiv = "";
let currYear = 0;
let currWeek = "";

type DivisionProps = {
	options: string[];
	initialValue: string;
};
function DivisionDropdown({ options, initialValue }: DivisionProps) {
	const [selected, setSelected] = useState(initialValue.toLowerCase());
	const router = useRouter();

	const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSelected(e.target.value);
		router.push(`/ranking/${e.target.value}/${currYear}/${currWeek}`);
	};

	return (
		<select className={styles.divisionDropdown} value={selected} onChange={handleChange}>
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
	initialValue: number;
};
function YearDropdown({ options, initialValue }: YearProps) {
	const [selected, setSelected] = useState(initialValue);
	const router = useRouter();

	const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSelected(Number(e.target.value));
		router.push(`/ranking/${currDiv}/${e.target.value}/${currWeek}`);
	};

	return (
		<select className={styles.yearDropdown} value={selected} onChange={handleChange}>
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
	initialValue: string;
};
function WeekDropdown({ options, initialValue }: WeekProps) {
	const optionList = [];
	for (let i = 1; i <= options.weeks; i++) {
		optionList.push({ value: i, text: "Week " + i });
	}
	if (options.postseason) {
		optionList.push({ value: "final", text: "Final" });
	}

	const [selected, setSelected] = useState(initialValue.toLowerCase());
	const router = useRouter();

	const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSelected(e.target.value);
		router.push(`/ranking/${currDiv}/${currYear}/${e.target.value}`);
	};

	return (
		<select className={styles.weekDropdown} value={selected} onChange={handleChange}>
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
	currDiv = division.toLowerCase();
	currYear = year;
	currWeek = week.toLowerCase();
	const years: string[] = [];
	for (const key in availRanks) {
		years.push(key);
	}
	years.sort().reverse();
	return (
		<div className={styles.selectorStyling}>
			<DivisionDropdown options={DIVISIONS} initialValue={division} />
			<YearDropdown options={years} initialValue={year} />
			<WeekDropdown options={availRanks[year]} initialValue={week} />
		</div>
	);
}
