import dynamic from "next/dynamic";
import styles from "./header.module.css";
import utilStyles from "../styles/common.module.css";
import Link from "next/link";
import Selector from "./selector";

const ThemeToggle = dynamic(() => import("../components/themeToggle"), {
  ssr: false,
});

export default function Header() {
  return (
    <div id='fixed' className={styles.header}>
      <div className={styles.headerTitle}>
        <Link href="/">
          Robby's Ranking
        </Link>
      </div>
      <div className={styles.headerLink}>
        <Link href="/game-count">
          <span className={utilStyles.headingMd}>
            Game Count
          </span>
        </Link>
      </div>
      <div className={styles.headerLink}>
        <Link href="/teams">
          <span className={utilStyles.headingMd}>
            Teams
          </span>
        </Link>
      </div>
      <div className={styles.headerLink}>
        <Link href="/about">
          <span className={utilStyles.headingMd}>
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
