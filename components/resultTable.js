import React from 'react';
import {
  Column,
  Table,
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import Selector from './selector';
import DataTablesScripts from './dataTablesScripts';
import styles from './resultTable.module.css';

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('final_rank', {
    header: () => 'Rank',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('name', {
    header: () => 'Team',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('conf', {
    header: () => 'Conf',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('record', {
    header: () => 'Record',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('srs_rank', {
    header: () => 'SRS',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('sos_rank', {
    header: () => 'SOS',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('sov_rank', {
    header: () => 'SOV',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('final_raw', {
    header: () => 'Final',
    cell: info => info.getValue().toFixed(5),
    footer: info => info.column.id,
  }),
]

export default function ResultTable({ rankList, teamList, division, year, week }) {
  var data = []
  for (var i = 0; i < teamList.length; i++) {
    data.push({
      final_rank: teamList[i].final_rank,
      name: teamList[i].name,
      conf: teamList[i].conf,
      record: teamList[i].wins + "-" + teamList[i].losses,
      srs_rank: teamList[i].srs_rank,
      sos_rank: teamList[i].sos_rank,
      sov_rank: teamList[i].sov_rank,
      final_raw: teamList[i].final_raw,
    })
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={styles.resultStyles}>
      <Selector rankList={rankList} division={division} year={year} week={week} />
      <div id="tableTop">
      </div>
      <DataTablesScripts />
      <table id="resultTable">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, i, row) => (
              <th key={header.id} className={i + 1 === row.length ? styles.lastColumn : ""}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </th>
            ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
            {row.getVisibleCells().map((cell, i, row) => (
              <td key={cell.id} className={i + 1 === row.length ? styles.lastColumn : ""}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
