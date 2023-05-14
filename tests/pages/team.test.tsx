import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { CHART_MAX_Y, REVALIDATE } from "@lib/constants";
import { ChartPoint, TeamRank, Team as TeamType } from "@lib/types";
import { getTeamPathParams, getTeamRankings } from "@lib/utils";
import Team, { getStaticPaths, getStaticProps } from "@pages/team/[team]";

jest.mock("@lib/utils", () => ({
	__esModule: true,
	getTeamRankings: jest.fn(),
	getTeamPathParams: jest.fn(),
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

const scInfo: TeamType = {
	team_id: 2579,
	name: "South Carolina",
	logo: "/logo/south-carolina.png",
	logo_dark: "/logo-dark/south-carolina.png",
};

describe("Team page", () => {
	it("renders correctly", async () => {
		const rankList: ChartPoint[] = [];
		const years = [2022, 2023];
		years.forEach((year) => {
			for (let i = 1; i < 16; i++) {
				rankList.push({
					week: `${year} Week ${i}`,
					rank: i,
					fillLevel: 25,
				});
			}
		});

		const { baseElement } = render(<Team team={scInfo} rankList={rankList} years={years} />);
		await screen.findByText(/South Carolina/i);

		expect(baseElement).toMatchSnapshot();
	});

	describe("getStaticProps", () => {
		it("returns correctly", async () => {
			const mockReturn: TeamRank[] = [
				{
					team: scInfo,
					final_rank: 1,
					year: 2022,
					week: "1",
					postseason: 0,
				},
				{
					team: scInfo,
					final_rank: 2,
					year: 2022,
					week: "2",
					postseason: 0,
				},
				{
					team: scInfo,
					final_rank: 3,
					year: 2022,
					week: "1",
					postseason: 1,
				},
				{
					team: scInfo,
					final_rank: 4,
					year: 2023,
					week: "1",
					postseason: 0,
				},
			];
			(getTeamRankings as jest.Mock).mockReturnValue(mockReturn);

			const expected = {
				props: {
					team: scInfo,
					rankList: [
						{
							week: "2022 Week 1",
							rank: 1,
							fillLevel: CHART_MAX_Y,
						},
						{
							week: "2022 Week 2",
							rank: 2,
							fillLevel: CHART_MAX_Y,
						},
						{
							week: "2022 Week Final",
							rank: 3,
							fillLevel: CHART_MAX_Y,
						},
						{
							week: "2023 Week 1",
							rank: 4,
							fillLevel: CHART_MAX_Y,
						},
					],
					years: [2022, 2023],
				},
				revalidate: REVALIDATE,
			};
			const result = await getStaticProps({ params: { team: "2579" } });

			expect(result).toEqual(expected);
			expect(getTeamRankings).toBeCalledTimes(1);
		});

		describe("redirects", () => {
			it("params undefined", async () => {
				const expected = {
					redirect: {
						permanent: false,
						destination: "/teams",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: undefined });

				expect(result).toEqual(expected);
			});

			it("team undefined", async () => {
				const expected = {
					redirect: {
						permanent: false,
						destination: "/teams",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: { team: undefined } });

				expect(result).toEqual(expected);
			});

			it("team not a number", async () => {
				const expected = {
					redirect: {
						permanent: false,
						destination: "/teams",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: { team: "invalid" } });

				expect(result).toEqual(expected);
			});

			it("team ranks empty", async () => {
				(getTeamRankings as jest.Mock).mockReturnValue([]);

				const expected = {
					redirect: {
						permanent: false,
						destination: "/teams",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: { team: "2579" } });

				expect(result).toEqual(expected);
				expect(getTeamRankings).toBeCalledTimes(1);
			});
		});
	});

	it("getStaticPaths", async () => {
		const expectedPaths = [
			{
				params: {
					team: 2579,
				},
			},
			{
				params: {
					team: 52,
				},
			},
		];
		(getTeamPathParams as jest.Mock).mockReturnValue(expectedPaths);

		const expected = {
			paths: expectedPaths,
			fallback: "blocking",
		};

		const paths = await getStaticPaths();

		expect(paths).toEqual(expected);
		expect(getTeamPathParams).toBeCalledTimes(1);
	});
});
