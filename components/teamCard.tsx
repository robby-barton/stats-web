import Link from "next/link";

import styles from "@components/teamCard.module.css";
import commonStyles from "@styles/common.module.css";

type TeamCardProps = {
	name: string;
	id: number;
};
export default function TeamCard({ name, id }: TeamCardProps) {
	return (
		<Link href={`/team/${id}`}>
			<div className={styles.card}>
				<span className={commonStyles.headingMd}>{name}</span>
			</div>
		</Link>
	);
}
