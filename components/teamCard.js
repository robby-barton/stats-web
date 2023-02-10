import React from 'react';
import Link from "next/link";
import utilStyles from "../styles/utils.module.css";

export default function TeamCard({ name, id }) {
  return (
    <Link href={`/team/${id}`}>
      <div className={utilStyles.headingMd}>
        {name}
      </div>
    </Link>
  );
}
