import React, { useState } from 'react';
import TeamList from './teamList';
import styles from './teamSearch.module.css'

export default function TeamSearch({ teams }) {
  const [searchField, setSearchField] = useState("")

  const filteredTeams = teams.filter(
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
      <TeamList teams={filteredTeams} />
    )
  }

  return (
    <div>
      <div>
        <input
          className={styles.teamSearch}
          type="search"
          placeholder="Search Teams"
          onChange={handleChange}
        />
      </div>
      {searchTeams()}
    </div>
  )
}
