// pages/index.js

import dynamic from "next/dynamic";
import styles from "./header.module.css";
import utilStyles from "../styles/utils.module.css";

const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
  ssr: false,
});

export default function Header() {
  return (
    <div className={styles.header}>
      <div className={styles.headerTitle}>
        Robby's Ranking
      </div>
      <div className={styles.ThemeToggle}>
        <ThemeToggle />
      </div>
    </div>
  );
}
