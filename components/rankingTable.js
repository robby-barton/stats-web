import { useReducer, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import styles from './rankingTable.module.css';
import commonStyles from '../styles/common.module.css';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

export default function RankingTable({ teams }) {
  const rerender = useReducer(() => ({}), {})[1]

  const [sorting, setSorting] = useState([])
  const router = useRouter()

  const columns = useMemo(
    () => [
      {
        accessorKey: 'final_rank',
        header: "Rank",
        cell: info => info.getValue(),
        sortDescFirst: false,
      },
      {
        accessorKey: 'name',
        header: "Team",
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'conf',
        header: "Conf",
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'record',
        header: "Record",
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'srs_rank',
        header: "SRS",
        cell: info => info.getValue(),
        sortDescFirst: false,
      },
      {
        accessorKey: 'sos_rank',
        header: "SOS",
        cell: info => info.getValue(),
        sortDescFirst: false,
      },
      {
        accessorKey: 'final_raw',
        header: "Final",
        cell: info => info.getValue().toFixed(5),
      },
    ],
    []
  )

  const getRowId = (row, relativeIndex, parent) => {
    return parent ? [parent.id, row.team_id].join('.') : row.team_id
  }

  const table = useReactTable({
    data: teams,
    columns,
    getRowId,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, i, row) => {
              return (
                <th key={header.id} colSpan={header.colSpan} className={i + 1 === row.length ? styles.lastColumn : ""}>
                  {header.isPlaceholder? null : (
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: "\u2191",
                        desc: "\u2193",
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  )}
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row=> {
          return (
            <tr key={row.id} onClick={() => router.push(`/team/${row.id}`)}>
              {row.getVisibleCells().map((cell, i, row) => {
                return (
                  <td key={cell.id} className={i + 1 === row.length ? styles.lastColumn : ""}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
