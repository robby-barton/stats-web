import Result from './result';

export default function ResultList({ teamList }) {
  const resultList = teamList.map(function(team){
    return (
      <Result team={team} />
    )
  })

  return (
      <table>
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>Record</th>
          <th>SRS</th>
          <th>SOS</th>
          <th>SOV</th>
          <th>Final</th>
        </tr>

        { resultList }
      </table>
  );
}
