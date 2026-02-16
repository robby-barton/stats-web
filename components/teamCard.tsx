import styles from '@components/teamCard.module.css';
import TeamName from '@components/teamName';
import { Team } from '@lib/types';

type TeamCardProps = {
	team: Team;
	sport?: string;
};
export default function TeamCard({ team, sport }: TeamCardProps) {
	return (
		<a href={`/team/${team.team_id}${sport ? `#${sport}` : ''}`}>
			<div className={styles.card}>
				<TeamName team={team} />
			</div>
		</a>
	);
}
