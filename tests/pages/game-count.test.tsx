import { render } from "@testing-library/react";

import "@testing-library/jest-dom";
import { REVALIDATE } from "@lib/constants";
import { TeamGames } from "@lib/types";
import { allGames } from "@lib/utils";
import GameCount, { getStaticProps } from "@pages/game-count";

jest.mock("@lib/utils", () => ({
	__esModule: true,
	allGames: jest.fn(),
}));

afterAll(() => {
	jest.unmock("@lib/utils");
});

afterEach(() => {
	jest.clearAllMocks();
});

beforeEach(() => {
	document.body.dataset.theme = "light";

	const mockIntersectionObserver = jest.fn();
	mockIntersectionObserver.mockReturnValue({
		observe: () => null,
		unobserve: () => null,
		disconnect: () => null,
	});
	window.IntersectionObserver = mockIntersectionObserver;
});

describe("Game Count page", () => {
	it("renders correctly", async () => {
		const games: TeamGames[] = [
			{
				team: {
					team_id: 2579,
					name: "South Carolina",
					logo: "/logo/south-carolina.png",
					logo_dark: "/logo-dark/south-carolina.png",
				},
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

		expect(baseElement).toMatchSnapshot();
	});

	it("getStaticProps returns correctly", async () => {
		const mockReturn = [
			{
				team: {
					team_id: 2579,
					name: "South Carolina",
					logo: "/logo/south-carolina.png",
					logo_dark: "/logo-dark/south-carolina.png",
				},
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
		(allGames as jest.Mock).mockReturnValue(mockReturn);

		const expected = {
			props: {
				games: mockReturn,
			},
			revalidate: REVALIDATE,
		};

		const result = await getStaticProps();

		expect(result).toEqual(expected);
	});
});
