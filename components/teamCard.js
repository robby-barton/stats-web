import React from 'react';
import Link from "next/link";
import styles from "./teamCard.module.css";
import commonStyles from "../styles/common.module.css";

export default function TeamCard({ name, id }) {
  return (
      <Link href={`/team/${id}`}>
        <div className={styles.card}>
          <span className={commonStyles.headingMd}>
            {name}
          </span>
        </div>
      </Link>
  );
}
