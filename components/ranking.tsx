import { ChangeEvent, useState } from 'react';
import Selector from './selector';
import RankingTable from './rankingTable';
import styles from './ranking.module.css';
import { AvailRanks, Rank } from '../lib/types';

type RankingProps = {
	availRanks: AvailRanks;
	ranking: Rank[];
	division: string;
	year: number;
	week: string;
}
export default function Ranking({ availRanks, ranking, division, year, week }: RankingProps) {
	const [searchField, setSearchField] = useState("")

	const filteredTeams = ranking.filter(
		team => {
			return (
				team.name.toLowerCase().includes(searchField.toLowerCase()) ||
				team.conf.toLowerCase().includes(searchField.toLowerCase())
			);
		}
	);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchField(e.target.value)
	};

	function searchTeams() {
		return (
			<RankingTable teams={filteredTeams} />
		)
	}

	return (
		<div>
			<div className={styles.inputArea}>
				<Selector availRanks={availRanks} division={division} year={year} week={week} />
				<div className={styles.searchDiv}>
					<input
						className={styles.searchInput}
						type="search"
						placeholder="Search Teams"
						onChange={handleChange}
					/>
				</div>
			</div>
			{searchTeams()}
		</div>
	)
}
