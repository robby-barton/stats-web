import React, { useState } from 'react';
import Selector from './selector';
import RankingTable from './rankingTable';
import styles from './ranking.module.css';

export default function Ranking({ rankList, teamList, division, year, week }) {
  const data = []
  for (let i = 0; i < teamList.length; i++) {
    data.push({
      team_id: teamList[i].team_id,
      final_rank: teamList[i].final_rank,
      name: teamList[i].name,
      conf: teamList[i].conf,
      record: teamList[i].ties === 0 ?
        teamList[i].wins + "-" + teamList[i].losses :
        teamList[i].wins + "-" + teamList[i].losses + "-" + teamList[i].ties,
      srs_rank: teamList[i].srs_rank,
      sos_rank: teamList[i].sos_rank,
      final_raw: teamList[i].final_raw,
    })
  }

  const [searchField, setSearchField] = useState("")

  const filteredTeams = data.filter(
    team => {
      return (
        team.name.toLowerCase().includes(searchField.toLowerCase()) ||
        team.conf.toLowerCase().includes(searchField.toLowerCase())
      );
    }
  );

  const handleChange = e => {
    setSearchField(e.target.value)
  };

  function searchTeams() {
    return (
      <RankingTable teams={filteredTeams} />
    )
  }

  return (
    <div>
      <div className={styles.inputArea}>
        <Selector rankList={rankList} division={division} year={year} week={week} />
        <div className={styles.searchDiv}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search Teams"
            onChange={handleChange}
          />
        </div>
      </div>
      {searchTeams()}
    </div>
  )
}
