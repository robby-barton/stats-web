import React from 'react';
import TeamCard from './teamCard';
import styles from './teamList.module.css';

export default function TeamList({ teams }) {
  return (
    <div className={styles.teamList}>
      {
        teams.map(team => <TeamCard name={team.name} id={team.team_id} />)
      }
    </div>
  );
}
