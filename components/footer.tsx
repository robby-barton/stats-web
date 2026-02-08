import styles from '@components/footer.module.css';

export default function Footer() {
	return (
		<div className={styles.footer}>
			<a href="https://github.com/robby-barton/stats-web">&lt;/&gt; - Site source</a>
			<br />
			<a href="https://github.com/robby-barton/stats-go">&lt;/&gt; - Ranking source</a>
		</div>
	);
}
