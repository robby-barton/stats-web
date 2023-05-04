import { ChangeEvent, useState } from 'react';
import GameTable from './gameTable';
import commonStyles from '../styles/common.module.css';
import styles from './games.module.css';
import { TeamGames } from '../lib/types';

type GamesProps = {
	games: TeamGames[];
}
export default function Games({ games }: GamesProps) {
	const [searchField, setSearchField] = useState("")

	const filteredTeams = games.filter(
		team => {
			return (
				team.name.toLowerCase().includes(searchField.toLowerCase())
			);
		}
	);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchField(e.target.value)
	};

	function searchTeams() {
		return (
			<GameTable teams={filteredTeams} />
		)
	}

	return (
		<div>
			<div className={commonStyles.inputArea}>
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
