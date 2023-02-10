import React from 'react';
import Link from "next/link";
import styles from "./teamCard.module.css";
import utilStyles from "../styles/utils.module.css";

export default function TeamCard({ name, id }) {
  return (
      <Link href={`/team/${id}`}>
        <div className={styles.card}>
          <span className={utilStyles.headingMd}>
            {name}
          </span>
        </div>
      </Link>
  );
}
