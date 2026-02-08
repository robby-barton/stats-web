import styles from '@components/header.module.css';
import ThemeToggle from '@components/themeToggle';
import commonStyles from '@styles/common.module.css';

export default function Header() {
	return (
		<div className={styles.header}>
			<div className={styles.headerTitle}>
				<a href="/">Robby&apos;s Ranking</a>
			</div>
			<div className={styles.headerLink}>
				<a href="/game-count">
					<span className={commonStyles.headingMd}>Game Count</span>
				</a>
			</div>
			<div className={styles.headerLink}>
				<a href="/teams">
					<span className={commonStyles.headingMd}>Teams</span>
				</a>
			</div>
			<div className={styles.headerLink}>
				<a href="/about">
					<span className={commonStyles.headingMd}>About</span>
				</a>
			</div>
			<div className={styles.headerToggle}>
				<ThemeToggle />
			</div>
		</div>
	);
}
