import React from 'react';
import {
  Column,
  Table,
  createColumnHelper,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  sortingFns,
  getSortedRowModel,
  FilterFn,
  SortingFn,
  ColumnDef,
  flexRender,
  FilterFns,
} from '@tanstack/react-table'
import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils'
import Selector from './selector';

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank,
  })

  return itemRank.passed
}

function DebouncedInput({ value: initialValue, onChange, debounce = 500, ...props }) {
  const [value, setValue] = React.useState(initialValue)
  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

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
  const [globalFilter, setGlobalFilter] = React.useState('')

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
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  return (
    <>
      <Selector rankList={rankList} division={division} year={year} week={week} />
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
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
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
