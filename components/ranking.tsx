import { ChangeEvent, useState } from 'react';

import styles from '@components/ranking.module.css';
import RankingTable from '@components/rankingTable';
import Selector from '@components/selector';
import { AvailRanks, Rank } from '@lib/types';

type RankingProps = {
	availRanks: AvailRanks;
	ranking: Rank[];
	division: string;
	year: number;
	week: string;
	sport: string;
};
export default function Ranking({ availRanks, ranking, division, year, week, sport }: RankingProps) {
	const [searchField, setSearchField] = useState('');

	const filteredTeams = ranking.filter((rank) => {
		return (
			rank.team.name.toLowerCase().includes(searchField.toLowerCase()) ||
			rank.conf.toLowerCase().includes(searchField.toLowerCase())
		);
	});

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchField(e.target.value);
	};

	function searchTeams() {
		return <RankingTable teams={filteredTeams} sport={sport} />;
	}

	return (
		<div>
			<div className={styles.inputArea}>
				<Selector availRanks={availRanks} division={division} year={year} week={week} sport={sport} />
				<div className={styles.searchDiv}>
					<input
						type="search"
						className={styles.searchInput}
						placeholder="Search Teams"
						onChange={handleChange}
					/>
				</div>
			</div>
			{searchTeams()}
		</div>
	);
}
