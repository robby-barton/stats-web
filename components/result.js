export default function Result({ team }) {
  return (
      <tr>
        <td>{team.final_rank}</td>
        <td>{team.team_names.name}</td>
        <td>{team.wins}-{team.losses}</td>
        <td>{team.srs_rank}</td>
        <td>{team.sos_rank}</td>
        <td>{team.sov_rank}</td>
        <td>{team.final_raw.toFixed(5)}</td>
      </tr>
  );
}
