import Link from "next/link";
import styles from "./footer.module.css";
import commonStyles from "../styles/common.module.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.footerLinks}>
        <Link href="https://github.com/robby-barton/stats-web">
          &lt;/&gt; - Site source
        </Link>
        <br/>
        <Link href="https://github.com/robby-barton/stats-go">
          &lt;/&gt; - Ranking source
        </Link>
      </div>
    </div>
  );
}
