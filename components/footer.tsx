import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
	return (
		<div className={styles.footer}>
			<Link href="https://github.com/robby-barton/stats-web">
				&lt;/&gt; - Site source
			</Link>
			<br />
			<Link href="https://github.com/robby-barton/stats-go">
				&lt;/&gt; - Ranking source
			</Link>
		</div>
	);
}
