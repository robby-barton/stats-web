import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import { Team } from "@lib/types";
import Teams from "@pages/teams";

describe("Teams page", () => {
	it("renders correctly", async () => {
		const teams: Team[] = [
			{
				team_id: 2579,
				name: "South Carolina",
			},
			{
				team_id: 228,
				name: "Clemson",
			},
		];
		const { baseElement } = render(<Teams teams={teams} />);
		await screen.findByTitle(/light mode/i);

		expect(baseElement).toMatchSnapshot();
	});
});
