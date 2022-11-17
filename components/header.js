import dynamic from "next/dynamic";
import styles from "./header.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";

const ThemeToggle = dynamic(() => import("../components/themeToggle"), {
  ssr: false,
});

export default function Header() {
  return (
    <div className={styles.header}>
      <div className={styles.headerTitle}>
        Robby's Ranking
      </div>
      <div className={styles.headerLink}>
        <Link href="/about">
          <span className={utilStyles.headingLg}>
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
