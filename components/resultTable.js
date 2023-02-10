import React, { useEffect } from 'react';
import Link from "next/link";
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
import styles from './resultTable.module.css';

import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables.min.js';
import 'datatables.net-fixedheader-dt/js/fixedHeader.dataTables.min.js';

import $ from 'jquery';

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
  columnHelper.accessor('final_raw', {
    header: () => 'Final',
    cell: info => info.getValue().toFixed(5),
    footer: info => info.column.id,
  }),
]

export default function ResultTable({ rankList, teamList, division, year, week }) {
  useEffect(() => {
    let table
    $(document).ready(function () {
      table = $('#resultTable').DataTable({
        dom: '<"dom_wrapper"f>t',
        paging: false,
        searching: true,
        orderClasses: false,
        info: false,
        fixedHeader: {
          header: true,
          headerOffset: $('#tableTop').offset().top + $('#tableTop').outerHeight(true)
        }
      })
    })

    return () => {
      if (table) {
        table.destroy()
      }
    }
  }, [])

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

  const getRowId = (row, relativeIndex, parent) => {
    return parent ? [parent.id, row.team_id].join('.') : row.team_id
  }

  const reactTable = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={styles.resultStyles}>
      <Selector rankList={rankList} division={division} year={year} week={week} />
      <div id="tableTop">
      </div>
      <table id="resultTable">
        <thead>
          {reactTable.getHeaderGroups().map(headerGroup => (
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
          {reactTable.getRowModel().rows.map(row => (
            <tr key={row.id} onClick={() => window.location.href = `/team/${row.id}`}>
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
