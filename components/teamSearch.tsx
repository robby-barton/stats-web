'use client';

import { ChangeEvent, useState } from 'react';

import TeamList from '@components/teamList';
import { Team } from '@lib/types';

import styles from '@components/teamSearch.module.css';

type TeamSearchProps = {
	teams: Team[];
};
export default function TeamSearch({ teams }: TeamSearchProps) {
	const [searchField, setSearchField] = useState('');

	const filteredTeams = teams.filter((team) => {
		return team.name.toLowerCase().includes(searchField.toLowerCase());
	});

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchField(e.target.value);
	};

	function searchTeams() {
		return <TeamList teams={filteredTeams} />;
	}

	return (
		<div>
			<div>
				<input className={styles.teamSearch} type="search" placeholder="Search Teams" onChange={handleChange} />
			</div>
			{searchTeams()}
		</div>
	);
}
