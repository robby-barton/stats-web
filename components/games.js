import React, { useState } from 'react';
import GameTable from './gameTable';
import commonStyles from '../styles/common.module.css';
import styles from './games.module.css';

export default function Games({ games }) {
  const [searchField, setSearchField] = useState("")

  const filteredTeams = games.filter(
    team => {
      return (
        team.name.toLowerCase().includes(searchField.toLowerCase())
      );
    }
  );

  const handleChange = e => {
    setSearchField(e.target.value)
  };

  function searchTeams() {
    return (
      <GameTable teams={filteredTeams} />
    )
  }

  return (
    <div>
      <div className={commonStyles.inputArea}>
        <div className={styles.searchDiv}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search Teams"
            onChange={handleChange}
          />
        </div>
      </div>
      <div id="tableTop">
      </div>
      {searchTeams()}
    </div>
  )
}
