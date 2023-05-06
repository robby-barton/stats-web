import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import { TeamGames } from "@lib/types";
import GameCount from "@pages/game-count";

describe("Game Count page", () => {
	it("renders correctly", async () => {
		const games: TeamGames[] = [
			{
				name: "South Carolina",
				team_id: 2579,
				sun: 1,
				mon: 2,
				tue: 3,
				wed: 4,
				thu: 5,
				fri: 6,
				sat: 7,
				total: 8,
			},
		];
		const { baseElement } = render(<GameCount games={games} />);
		await screen.findByTitle(/light mode/i);

		expect(baseElement).toMatchSnapshot();
	});
});
