import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import Games from "@components/games";
import { ThemeProvider } from "@components/themeProvider";
import { TeamGames } from "@lib/types";

describe("Games", () => {
	it("team search works", () => {
		const games: TeamGames[] = [
			{
				team_id: 2579,
				name: "South Carolina",
				sun: 1,
				mon: 2,
				tue: 3,
				wed: 4,
				thu: 5,
				fri: 6,
				sat: 7,
				total: 10,
			},
			{
				team_id: 6,
				name: "FSU",
				sun: 7,
				mon: 6,
				tue: 5,
				wed: 4,
				thu: 3,
				fri: 2,
				sat: 1,
				total: 10,
			},
		];
		render(
			<ThemeProvider>
				<Games games={games} />
			</ThemeProvider>
		);

		const team = screen.getByText("South Carolina");
		expect(team).toBeInTheDocument();

		fireEvent.change(screen.getByRole("searchbox"), { target: { value: "FSU" } });
		expect(team).not.toBeInTheDocument();
	});
});
