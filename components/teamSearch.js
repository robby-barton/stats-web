import React, { useState } from 'react';
import TeamList from './teamList';

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
    <>
      <input type="search" placehodler="Search Teams" onChange={handleChange} />
      {searchTeams()}
    </>
  )
}
