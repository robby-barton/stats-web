import Link from "next/link";

import styles from "@components/teamCard.module.css";
import TeamName from "@components/teamName";
import { Team } from "@lib/types";

type TeamCardProps = {
	team: Team;
};
export default function TeamCard({ team }: TeamCardProps) {
	return (
		<Link href={`/team/${team.team_id}`}>
			<div className={styles.card}>
				<TeamName team={team} />
			</div>
		</Link>
	);
}
