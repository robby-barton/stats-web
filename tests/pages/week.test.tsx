import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { REVALIDATE } from "@lib/constants";
import { AvailRanks, Rank } from "@lib/types";
import { availableRankings, getRanking, getRankingPathParams } from "@lib/utils";
import Week, { getStaticPaths, getStaticProps } from "@pages/ranking/[division]/[year]/[week]";

jest.mock("next/router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("@lib/utils", () => ({
	__esModule: true,
	availableRankings: jest.fn(),
	getRanking: jest.fn(),
	getRankingPathParams: jest.fn(),
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

describe("Week page", () => {
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
		const { baseElement } = render(
			<Week availRanks={avail} ranking={ranks} division="fbs" week="Final" year={2023} />
		);

		expect(baseElement).toMatchSnapshot();
	});

	describe("getStaticProps", () => {
		describe("returns correctly", () => {
			it("midyear", async () => {
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
						ranking: rankingMock,
						division: "FBS",
						year: 2022,
						week: "10",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: { division: "fbs", year: "2022", week: "10" } });

				expect(result).toEqual(expected);

				expect(availableRankings).toBeCalledTimes(1);
				expect(getRanking).toBeCalledTimes(1);
				expect(getRanking).toBeCalledWith(true, 2022, "10");
			});

			it("final", async () => {
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
						ranking: rankingMock,
						division: "FBS",
						year: 2022,
						week: "Final",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: { division: "fbs", year: "2022", week: "final" } });

				expect(result).toEqual(expected);

				expect(availableRankings).toBeCalledTimes(1);
				expect(getRanking).toBeCalledTimes(1);
				expect(getRanking).toBeCalledWith(true, 2022, "final");
			});

			it("fcs", async () => {
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
						ranking: rankingMock,
						division: "FCS",
						year: 2022,
						week: "Final",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: { division: "fcs", year: "2022", week: "final" } });

				expect(result).toEqual(expected);

				expect(availableRankings).toBeCalledTimes(1);
				expect(getRanking).toBeCalledTimes(1);
				expect(getRanking).toBeCalledWith(false, 2022, "final");
			});
		});

		describe("redirects", () => {
			it("params undefined", async () => {
				const availMock: AvailRanks = {
					"2022": {
						weeks: 16,
						postseason: true,
					},
				};
				(availableRankings as jest.Mock).mockReturnValue(availMock);

				const expected = {
					redirect: {
						permanent: false,
						destination: "/",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({});

				expect(result).toEqual(expected);

				expect(availableRankings).toBeCalledTimes(1);
				expect(getRanking).toBeCalledTimes(0);
			});

			it("params not string", async () => {
				const availMock: AvailRanks = {
					"2022": {
						weeks: 16,
						postseason: true,
					},
				};
				(availableRankings as jest.Mock).mockReturnValue(availMock);

				const expected = {
					redirect: {
						permanent: false,
						destination: "/",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({
					params: { division: undefined, year: undefined, week: undefined },
				});

				expect(result).toEqual(expected);

				expect(availableRankings).toBeCalledTimes(1);
				expect(getRanking).toBeCalledTimes(0);
			});

			it("invalid division", async () => {
				const availMock: AvailRanks = {
					"2022": {
						weeks: 16,
						postseason: true,
					},
				};
				(availableRankings as jest.Mock).mockReturnValue(availMock);

				const expected = {
					redirect: {
						permanent: false,
						destination: "/",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: { division: "invalid", year: "2022", week: "final" } });

				expect(result).toEqual(expected);

				expect(availableRankings).toBeCalledTimes(1);
				expect(getRanking).toBeCalledTimes(0);
			});

			it("invalid year", async () => {
				const availMock: AvailRanks = {
					"2022": {
						weeks: 16,
						postseason: true,
					},
				};
				(availableRankings as jest.Mock).mockReturnValue(availMock);

				const expected = {
					redirect: {
						permanent: false,
						destination: "/",
					},
					revalidate: REVALIDATE,
				};

				const result = await getStaticProps({ params: { division: "fbs", year: "invalid", week: "final" } });

				expect(result).toEqual(expected);

				expect(availableRankings).toBeCalledTimes(1);
				expect(getRanking).toBeCalledTimes(0);
			});

			describe("invalid week", () => {
				it("string postseason", async () => {
					const availMock: AvailRanks = {
						"2022": {
							weeks: 16,
							postseason: true,
						},
					};
					(availableRankings as jest.Mock).mockReturnValue(availMock);

					const expected = {
						redirect: {
							permanent: false,
							destination: "/ranking/fbs/2022/final",
						},
						revalidate: REVALIDATE,
					};

					const result = await getStaticProps({ params: { division: "fbs", year: "2022", week: "invalid" } });

					expect(result).toEqual(expected);

					expect(availableRankings).toBeCalledTimes(1);
					expect(getRanking).toBeCalledTimes(0);
				});

				it("string midyear", async () => {
					const availMock: AvailRanks = {
						"2022": {
							weeks: 16,
							postseason: false,
						},
					};
					(availableRankings as jest.Mock).mockReturnValue(availMock);

					const expected = {
						redirect: {
							permanent: false,
							destination: "/ranking/fbs/2022/16",
						},
						revalidate: REVALIDATE,
					};

					const result = await getStaticProps({ params: { division: "fbs", year: "2022", week: "invalid" } });

					expect(result).toEqual(expected);

					expect(availableRankings).toBeCalledTimes(1);
					expect(getRanking).toBeCalledTimes(0);
				});

				it("not postseason", async () => {
					const availMock: AvailRanks = {
						"2022": {
							weeks: 16,
							postseason: false,
						},
					};
					(availableRankings as jest.Mock).mockReturnValue(availMock);

					const expected = {
						redirect: {
							permanent: false,
							destination: "/ranking/fbs/2022/16",
						},
						revalidate: REVALIDATE,
					};

					const result = await getStaticProps({ params: { division: "fbs", year: "2022", week: "final" } });

					expect(result).toEqual(expected);

					expect(availableRankings).toBeCalledTimes(1);
					expect(getRanking).toBeCalledTimes(0);
				});

				it("number negative", async () => {
					const availMock: AvailRanks = {
						"2022": {
							weeks: 16,
							postseason: true,
						},
					};
					(availableRankings as jest.Mock).mockReturnValue(availMock);

					const expected = {
						redirect: {
							permanent: false,
							destination: "/ranking/fbs/2022/1",
						},
						revalidate: REVALIDATE,
					};

					const result = await getStaticProps({ params: { division: "fbs", year: "2022", week: "-1" } });

					expect(result).toEqual(expected);

					expect(availableRankings).toBeCalledTimes(1);
					expect(getRanking).toBeCalledTimes(0);
				});

				it("number high postseason", async () => {
					const availMock: AvailRanks = {
						"2022": {
							weeks: 16,
							postseason: true,
						},
					};
					(availableRankings as jest.Mock).mockReturnValue(availMock);

					const expected = {
						redirect: {
							permanent: false,
							destination: "/ranking/fbs/2022/final",
						},
						revalidate: REVALIDATE,
					};

					const result = await getStaticProps({ params: { division: "fbs", year: "2022", week: "100" } });

					expect(result).toEqual(expected);

					expect(availableRankings).toBeCalledTimes(1);
					expect(getRanking).toBeCalledTimes(0);
				});

				it("number high midyear", async () => {
					const availMock: AvailRanks = {
						"2022": {
							weeks: 16,
							postseason: false,
						},
					};
					(availableRankings as jest.Mock).mockReturnValue(availMock);

					const expected = {
						redirect: {
							permanent: false,
							destination: "/ranking/fbs/2022/16",
						},
						revalidate: REVALIDATE,
					};

					const result = await getStaticProps({ params: { division: "fbs", year: "2022", week: "100" } });

					expect(result).toEqual(expected);

					expect(availableRankings).toBeCalledTimes(1);
					expect(getRanking).toBeCalledTimes(0);
				});
			});
		});
	});

	it("getStaticPaths", async () => {
		const expectedPaths = [
			{
				params: {
					division: "fbs",
					year: "2022",
					week: "1",
				},
			},
			{
				params: {
					division: "fbs",
					year: "2022",
					week: "2",
				},
			},
		];
		(getRankingPathParams as jest.Mock).mockReturnValue(expectedPaths);

		const expected = {
			paths: expectedPaths,
			fallback: "blocking",
		};

		const paths = await getStaticPaths();

		expect(paths).toEqual(expected);
	});
});
