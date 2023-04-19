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
import utilStyles from "../styles/common.module.css";

import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables.min.js';
import 'datatables.net-fixedheader-dt/js/fixedHeader.dataTables.min.js';

import $ from 'jquery';

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Team',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('sun', {
    header: () => 'Sun',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('mon', {
    header: () => 'Mon',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('tue', {
    header: () => 'Tue',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('wed', {
    header: () => 'Wed',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('thu', {
    header: () => 'Thu',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('fri', {
    header: () => 'Fri',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('sat', {
    header: () => 'Sat',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('total', {
    header: () => 'Total',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
]

export default function GameTable({ games }) {
  useEffect(() => {
    let table
    $(document).ready(function () {
      table = $('#gameTable').DataTable({
        dom: '<"dom_wrapper"f>t',
        paging: false,
        searching: true,
        order: [columns.length - 1, 'desc'],
        orderClasses: false,
        info: false,
        fixedHeader: {
          header: true,
          headerOffset: $('#tableTop').offset().top + $('#tableTop').outerHeight(true)
        },
        columnDefs: [
          {
            targets: [0],
            orderSequence: ['asc', 'desc'],
          },
          {
            targets: "_all",
            orderSequence: ['desc', 'asc'],
          }
        ]
      })
    })

    return () => {
      if (table) {
        table.destroy()
      }
    }
  }, [])

  const getRowId = (row, relativeIndex, parent) => {
    return parent ? [parent.id, row.team_id].join('.') : row.team_id
  }

  const reactTable = useReactTable({
    data: games,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className={utilStyles.searchBoxArea}>
      </div>
      <div id="tableTop">
      </div>
      <table id="gameTable">
        <thead>
          {reactTable.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, i, row) => (
              <th key={header.id}>
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
            <tr key={row.id}>
            {row.getVisibleCells().map((cell, i, row) => (
              <td key={cell.id}>
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
