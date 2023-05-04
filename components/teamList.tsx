import TeamCard from './teamCard';
import styles from './teamList.module.css';
import { Team } from '../lib/types';

type TeamListProps = {
	teams: Team[];
}
export default function TeamList({ teams }: TeamListProps) {
	return (
		<div className={styles.teamList}>
			{
				teams.map(team => <TeamCard name={team.name} id={team.team_id} />)
			}
		</div>
	);
}
