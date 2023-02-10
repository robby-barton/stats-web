import React from 'react';
import TeamCard from './teamCard';

export default function TeamList({ teams }) {
  return (
    <>
      {
        teams.map(team => <TeamCard name={team.name} id={team.team_id} />)
      }
    </>
  );
}
