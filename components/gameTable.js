import React from 'react';

export default function GameTable({ teams }) {
  return (
    <table>
      <thead>
        <tr key="head">
          <th key="headTeam">Team</th>
          <th key="headSun">Sun</th>
          <th key="headMon">Mon</th>
          <th key="headTue">Tue</th>
          <th key="headWed">Wed</th>
          <th key="headThu">Thu</th>
          <th key="headFri">Fri</th>
          <th key="headSat">Sat</th>
          <th key="headTotal">Total</th>
        </tr>
      </thead>
      <tbody>
        {teams.map(row => (
          <tr key={row.team_id}>
            <td key={row.team_id+"name"}>{row.name}</td>
            <td key={row.team_id+"sun"}>{row.sun}</td>
            <td key={row.team_id+"mon"}>{row.mon}</td>
            <td key={row.team_id+"tue"}>{row.tue}</td>
            <td key={row.team_id+"wed"}>{row.wed}</td>
            <td key={row.team_id+"thu"}>{row.thu}</td>
            <td key={row.team_id+"fri"}>{row.fri}</td>
            <td key={row.team_id+"sat"}>{row.sat}</td>
            <td key={row.team_id+"total"}>{row.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
