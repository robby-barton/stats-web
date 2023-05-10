import Link from "next/link";

import styles from "@components/teamCard.module.css";
import TeamName from "@components/teamName";

type TeamCardProps = {
	name: string;
	id: number;
};
export default function TeamCard({ name, id }: TeamCardProps) {
	return (
		<Link href={`/team/${id}`}>
			<div className={styles.card}>
				{/* <span className={commonStyles.headingMd}>{name}</span> */}
				<TeamName team_id={id} name={name} />
			</div>
		</Link>
	);
}
