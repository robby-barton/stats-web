import { render } from "@testing-library/react";

import "@testing-library/jest-dom";

import { REVALIDATE } from "@lib/constants";
import { AvailRanks, Rank } from "@lib/types";
import { availableRankings, getRanking } from "@lib/utils";
import Home, { getStaticProps } from "@pages/index";

jest.mock("next/router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("@lib/utils", () => ({
	__esModule: true,
	availableRankings: jest.fn(),
	getRanking: jest.fn(),
}));

afterAll(() => {
	jest.unmock("@lib/utils");
	jest.unmock("next/router");
});

afterEach(() => {
	jest.clearAllMocks();
});

beforeEach(() => {
	document.body.dataset.theme = "light";
});

describe("Home page", () => {
	it("renders correctly", async () => {
		const avail: AvailRanks = {
			"2023": {
				weeks: 16,
				postseason: true,
			},
		};
		const ranks: Rank[] = [
			{
				team_id: 2579,
				name: "South Carolina",
				conf: "SEC",
				record: "8-5",
				sos_rank: 13,
				srs_rank: 15,
				final_raw: 0.123456789,
				final_rank: 26,
			},
		];
		const { baseElement } = render(<Home availRanks={avail} fbs={ranks} week="Final" year={2023} />);

		expect(baseElement).toMatchSnapshot();
	});

	describe("getStaticProps", () => {
		it("returns correctly midyear", async () => {
			const availMock: AvailRanks = {
				"2022": {
					weeks: 10,
					postseason: false,
				},
			};
			(availableRankings as jest.Mock).mockReturnValue(availMock);

			const rankingMock: Rank[] = [
				{
					team_id: 2579,
					name: "South Carolina",
					conf: "SEC",
					final_rank: 1,
					final_raw: 0.123456789,
					record: "8-5",
					sos_rank: 2,
					srs_rank: 3,
				},
			];
			(getRanking as jest.Mock).mockReturnValue(rankingMock);

			const expected = {
				props: {
					availRanks: availMock,
					fbs: rankingMock,
					year: 2022,
					week: "10",
				},
				revalidate: REVALIDATE,
			};

			const result = await getStaticProps();

			expect(result).toEqual(expected);

			expect(availableRankings).toBeCalledTimes(1);
			expect(getRanking).toBeCalledTimes(1);
			expect(getRanking).toBeCalledWith(true, 2022, "10");
		});

		it("returns correctly final", async () => {
			const availMock: AvailRanks = {
				"2022": {
					weeks: 16,
					postseason: true,
				},
			};
			(availableRankings as jest.Mock).mockReturnValue(availMock);

			const rankingMock: Rank[] = [
				{
					team_id: 2579,
					name: "South Carolina",
					conf: "SEC",
					final_rank: 1,
					final_raw: 0.123456789,
					record: "8-5",
					sos_rank: 2,
					srs_rank: 3,
				},
			];
			(getRanking as jest.Mock).mockReturnValue(rankingMock);

			const expected = {
				props: {
					availRanks: availMock,
					fbs: rankingMock,
					year: 2022,
					week: "final",
				},
				revalidate: REVALIDATE,
			};

			const result = await getStaticProps();

			expect(result).toEqual(expected);

			expect(availableRankings).toBeCalledTimes(1);
			expect(getRanking).toBeCalledTimes(1);
			expect(getRanking).toBeCalledWith(true, 2022, "final");
		});
	});
});
