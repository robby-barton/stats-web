import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

export default function GameTable({ teams }) {
  const rerender = React.useReducer(() => ({}), {})[1]

  const [sorting, setSorting] = React.useState([])

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: "Team",
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'sun',
        header: "Sun",
        cell: info => info.getValue(),
        sortDescFirst: true,
      },
      {
        accessorKey: 'mon',
        header: "Mon",
        cell: info => info.getValue(),
        sortDescFirst: true,
      },
      {
        accessorKey: 'tue',
        header: "Tue",
        cell: info => info.getValue(),
        sortDescFirst: true,
      },
      {
        accessorKey: 'wed',
        header: "Wed",
        cell: info => info.getValue(),
        sortDescFirst: true,
      },
      {
        accessorKey: 'thu',
        header: "Thu",
        cell: info => info.getValue(),
        sortDescFirst: true,
      },
      {
        accessorKey: 'fri',
        header: "Fri",
        cell: info => info.getValue(),
        sortDescFirst: true,
      },
      {
        accessorKey: 'sat',
        header: "Sat",
        cell: info => info.getValue(),
        sortDescFirst: true,
      },
      {
        accessorKey: 'total',
        header: "Total",
        cell: info => info.getValue(),
        sortDescFirst: true,
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
                <th key={header.id} colSpan={header.colSpan}>
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, i, row) => {
                return (
                  <td key={cell.id}>
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
