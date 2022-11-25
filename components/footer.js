import Link from "next/link";
import styles from "./footer.module.css";
import utilStyles from "../styles/utils.module.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.footerLinks}>
        <Link href="https://github.com/robby-barton/stats-web">
          Site &lt;/&gt;
        </Link>
        <br/>
        <Link href="https://github.com/robby-barton/stats-go">
          Ranking &lt;/&gt;
        </Link>
      </div>
    </div>
  );
}
