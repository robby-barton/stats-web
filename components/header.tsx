import dynamic from "next/dynamic";
import styles from "./header.module.css";
import commonStyles from "../styles/common.module.css";
import Link from "next/link";

const ThemeToggle = dynamic(() => import("../components/themeToggle"), {
	ssr: false,
});

export default function Header() {
	return (
		<div className={styles.header}>
			<div className={styles.headerTitle}>
				<Link href="/">
					Robby's Ranking
				</Link>
			</div>
			<div className={styles.headerLink}>
				<Link href="/game-count">
					<span className={commonStyles.headingMd}>
						Game Count
					</span>
				</Link>
			</div>
			<div className={styles.headerLink}>
				<Link href="/teams">
					<span className={commonStyles.headingMd}>
						Teams
					</span>
				</Link>
			</div>
			<div className={styles.headerLink}>
				<Link href="/about">
					<span className={commonStyles.headingMd}>
						About
					</span>
				</Link>
			</div>
			<div className={styles.headerToggle}>
				<ThemeToggle />
			</div>
		</div>
	);
}