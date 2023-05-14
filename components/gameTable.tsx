import { useMemo, useState } from "react";

import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import TeamName from "@components/teamName";
import { Team, TeamGames } from "@lib/types";

type GameTableProps = {
	teams: TeamGames[];
};
export default function GameTable({ teams }: GameTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns = useMemo<ColumnDef<TeamGames>[]>(
		() => [
			{
				accessorKey: "team",
				header: "Team",
				cell: (info) => <TeamName team={info.getValue() as Team} />,
				sortingFn: (rowA, rowB, columnId) => {
					const nameA = (rowA.getValue(columnId) as Team).name;
					const nameB = (rowB.getValue(columnId) as Team).name;

					return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
				},
				sortDescFirst: false,
			},
			{
				accessorKey: "sun",
				header: "Sun",
				cell: (info) => info.getValue(),
				sortDescFirst: true,
			},
			{
				accessorKey: "mon",
				header: "Mon",
				cell: (info) => info.getValue(),
				sortDescFirst: true,
			},
			{
				accessorKey: "tue",
				header: "Tue",
				cell: (info) => info.getValue(),
				sortDescFirst: true,
			},
			{
				accessorKey: "wed",
				header: "Wed",
				cell: (info) => info.getValue(),
				sortDescFirst: true,
			},
			{
				accessorKey: "thu",
				header: "Thu",
				cell: (info) => info.getValue(),
				sortDescFirst: true,
			},
			{
				accessorKey: "fri",
				header: "Fri",
				cell: (info) => info.getValue(),
				sortDescFirst: true,
			},
			{
				accessorKey: "sat",
				header: "Sat",
				cell: (info) => info.getValue(),
				sortDescFirst: true,
			},
			{
				accessorKey: "total",
				header: "Total",
				cell: (info) => info.getValue(),
				sortDescFirst: true,
			},
		],
		[]
	);

	const getRowId = (row: TeamGames) => {
		return row.team.team_id.toString();
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
						{headerGroup.headers.map((header) => {
							return (
								<th key={header.id} colSpan={header.colSpan}>
									<div
										{...{
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
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => {
								return (
									<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
