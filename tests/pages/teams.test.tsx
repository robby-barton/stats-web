import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import { REVALIDATE } from "@lib/constants";
import { Team } from "@lib/types";
import { getUniqueTeams } from "@lib/utils";
import Teams, { getStaticProps } from "@pages/teams";

jest.mock("@lib/utils", () => ({
	__esModule: true,
	getUniqueTeams: jest.fn(),
}));

afterAll(() => {
	jest.unmock("@lib/utils");
});

afterEach(() => {
	jest.clearAllMocks();
});

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

	it("getStaticProps returns correctly", async () => {
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
		(getUniqueTeams as jest.Mock).mockReturnValue(teams);

		const expected = {
			props: {
				teams: teams,
			},
			revalidate: REVALIDATE,
		};

		const result = await getStaticProps();

		expect(result).toEqual(expected);

		expect(getUniqueTeams).toBeCalledTimes(1);
	});
});
