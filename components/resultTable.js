import React, { useMemo, useState, useEffect } from 'react';
import { useTable } from 'react-table';

export default function ResultTable({ teamList }) {
  const columns = useMemo(() => [
    {
      Header: "Rank",
      accessor: "final_rank",
    },
    {
      Header: "Team",
      accessor: "name",
    },
    {
      Header: "Record",
      accessor: "record",
    },
    {
      Header: "SRS",
      accessor: "srs_rank",
    },
    {
      Header: "SOS",
      accessor: "sos_rank",
    },
    {
      Header: "SOV",
      accessor: "sov_rank",
    },
    {
      Header: "Final",
      accessor: "final_raw",
      Cell: ({ cell: { value } }) => {
        return (
          <>
            {value.toFixed(5)}
          </>
        )
      }
    },
  ])

  var data = []
  for (var i = 0; i < teamList.length; i++) {
    data.push({
      final_rank: teamList[i].final_rank,
      name: teamList[i].team_names.name,
      record: teamList[i].wins + "-" + teamList[i].losses,
      srs_rank: teamList[i].srs_rank,
      sos_rank: teamList[i].sos_rank,
      sov_rank: teamList[i].sov_rank,
      final_raw: teamList[i].final_raw,
    })
  }
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  })
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
