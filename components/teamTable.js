import React, { useState } from 'react';
import styles from './teamTable.module.css';

export default function TeamTable({ teams }) {
  return (
    <table id="resultTable">
      <thead>
        <tr key="head">
          <th key="headRank">Rank</th>
          <th key="headTeam">Team</th>
          <th key="headConf">Conf</th>
          <th key="headRecord">Record</th>
          <th key="headSRS">SRS</th>
          <th key="headSOS">SOS</th>
          <th key="headFinal" className={styles.lastColumn}>Final</th>
        </tr>
      </thead>
      <tbody>
        {teams.map(row => (
          <tr key={row.team_id} onClick={() => window.location.href = `/team/${row.team_id}`}>
            <td key={row.team_id+"rank"}>{row.final_rank}</td>
            <td key={row.team_id+"name"}>{row.name}</td>
            <td key={row.team_id+"conf"}>{row.conf}</td>
            <td key={row.team_id+"record"}>{row.record}</td>
            <td key={row.team_id+"srs"}>{row.srs_rank}</td>
            <td key={row.team_id+"sos"}>{row.sos_rank}</td>
            <td key={row.team_id+"final"} className={styles.lastColumn}>{row.final_raw}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
