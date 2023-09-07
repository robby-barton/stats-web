import TeamLogo from '@components/teamLogo';
import { Team } from '@lib/types';

import styles from '@components/teamName.module.css';

export default function TeamName({ team }: { team: Team }) {
	return (
		<div className={styles.container}>
			<div className={styles.logo}>
				<TeamLogo team={team} />
			</div>
			<div className={styles.name}>
				<span>{team.name}</span>
			</div>
		</div>
	);
}
