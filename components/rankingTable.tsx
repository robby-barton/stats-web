import { useMemo, useState } from "react";

import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/router";

import styles from "@components/rankingTable.module.css";
import TeamName from "@components/teamName";
import { Rank } from "@lib/types";

type RankingTableProps = {
	teams: Rank[];
};
export default function RankingTable({ teams }: RankingTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const router = useRouter();

	const columns = useMemo<ColumnDef<Rank>[]>(
		() => [
			{
				accessorKey: "final_rank",
				header: "Rank",
				cell: (info) => info.getValue(),
				sortDescFirst: false,
			},
			{
				accessorKey: "name",
				header: "Team",
				cell: (info) => <TeamName team_id={Number(info.row.id)} name={info.getValue() as string} />,
			},
			{
				accessorKey: "conf",
				header: "Conf",
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "record",
				header: "Record",
				cell: (info) => info.getValue(),
				enableSorting: false,
			},
			{
				accessorKey: "srs_rank",
				header: "SRS",
				cell: (info) => info.getValue(),
				sortDescFirst: false,
			},
			{
				accessorKey: "sos_rank",
				header: "SOS",
				cell: (info) => info.getValue(),
				sortDescFirst: false,
			},
			{
				accessorKey: "final_raw",
				header: "Final",
				cell: (info) => (info.getValue() as number).toFixed(5),
			},
		],
		[]
	);

	const getRowId = (row: Rank) => {
		return row.team_id.toString();
	};

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
	});
	return (
		<table>
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header, i, row) => {
							return (
								<th
									key={header.id}
									colSpan={header.colSpan}
									className={i + 1 === row.length ? styles.lastColumn : ""}
								>
									<div
										{...{
											className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
											onClick: header.column.getToggleSortingHandler(),
										}}
									>
										{flexRender(header.column.columnDef.header, header.getContext())}
										{{
											asc: "\u2191",
											desc: "\u2193",
										}[header.column.getIsSorted() as string] ?? null}
									</div>
								</th>
							);
						})}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => {
					return (
						<tr key={row.id} onClick={() => router.push(`/team/${row.id}`)}>
							{row.getVisibleCells().map((cell, i, row) => {
								return (
									<td key={cell.id} className={i + 1 === row.length ? styles.lastColumn : ""}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
