import TeamCard from '@components/teamCard';
import { Team } from '@lib/types';

import styles from '@components/teamList.module.css';

type TeamListProps = {
	teams: Team[];
};
export default function TeamList({ teams }: TeamListProps) {
	return (
		<div className={styles.teamList}>
			{teams.map((team) => (
				<TeamCard key={team.team_id} team={team} />
			))}
		</div>
	);
}
