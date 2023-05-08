import "@testing-library/jest-dom";

import { allGamesDB, availableRankingsDB, getRankingDB, getTeamRankingsDB, getUniqueTeamsDB } from "@lib/dbFuncs";
import { AvailRanks, Rank, RankingPathParams, Team, TeamGames, TeamPathParams, TeamRank } from "@lib/types";
import { allGames, getRanking, getTeamPathParams, getTeamRankings, getUniqueTeams } from "@lib/utils";

jest.mock("@lib/dbFuncs", () => ({
	__esModule: true,
	availableRankingsDB: jest.fn(),
	getRankingDB: jest.fn(),
	getTeamRankingsDB: jest.fn(),
	getUniqueTeamsDB: jest.fn(),
	allGamesDB: jest.fn(),
}));

afterAll(() => {
	jest.unmock("@lib/dbFuncs");
});

afterEach(() => {
	jest.clearAllMocks();
});

describe("utils", () => {
	describe("availableRankings", () => {
		// availableRankings uses and internal variable to only update
		// the available rankings every 5 minutes, so re-import for each
		// test to ensure it doesn't pollute the testing
		let availableRankings: () => Promise<AvailRanks>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				availableRankings = utils.availableRankings;
				expect(availableRankings).not.toBe(undefined);
			});
		});

		it("throws error if empty return", async () => {
			(availableRankingsDB as jest.Mock).mockReturnValue(Promise.resolve([]));

			await expect(availableRankings()).rejects.toThrow(Error("Not found"));
			expect(availableRankingsDB).toBeCalledTimes(1);
		});

		it("returns correct values", async () => {
			const mockReturn = [
				{
					year: "2022",
					weeks: 16,
					postseason: 0,
				},
			];
			(availableRankingsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: AvailRanks = {
				"2022": {
					weeks: 16,
					postseason: false,
				},
			};

			const avail = await availableRankings();

			expect(availableRankingsDB).toBeCalledTimes(1);
			expect(avail).toEqual(expected);
		});

		it("returns consecutive correct values", async () => {
			const mockReturn = [
				{
					year: "2022",
					weeks: 16,
					postseason: 1,
				},
			];
			(availableRankingsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: AvailRanks = {
				"2022": {
					weeks: 16,
					postseason: true,
				},
			};

			const avail = await availableRankings();
			const avail2 = await availableRankings();

			expect(availableRankingsDB).toBeCalledTimes(1);
			expect(avail).toEqual(expected);
			expect(avail).toEqual(avail2);
		});
	});

	describe("getRanking", () => {
		it("converts db return to Rank", async () => {
			const mockReturn = [
				{
					team_id: 2579,
					name: "South Carolina",
					conf: "SEC",
					final_rank: 1,
					final_raw: 0.123456789,
					wins: 8,
					losses: 5,
					ties: 0,
					sos_rank: 2,
					srs_rank: 3,
				},
			];
			(getRankingDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: Rank[] = [
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

			const ranking = await getRanking(true, 2022, "Final");

			expect(getRankingDB).toBeCalledTimes(1);
			expect(ranking).toEqual(expected);
		});

		it("converts db return to Rank with tie", async () => {
			const mockReturn = [
				{
					team_id: 2579,
					name: "South Carolina",
					conf: "SEC",
					final_rank: 1,
					final_raw: 0.123456789,
					wins: 8,
					losses: 5,
					ties: 1,
					sos_rank: 2,
					srs_rank: 3,
				},
			];
			(getRankingDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: Rank[] = [
				{
					team_id: 2579,
					name: "South Carolina",
					conf: "SEC",
					final_rank: 1,
					final_raw: 0.123456789,
					record: "8-5-1",
					sos_rank: 2,
					srs_rank: 3,
				},
			];

			const ranking = await getRanking(true, 2022, "Final");

			expect(getRankingDB).toBeCalledTimes(1);
			expect(ranking).toEqual(expected);
		});
	});

	describe("getTeamRankings", () => {
		it("passes return through", async () => {
			const mockReturn: TeamRank[] = [
				{
					team_id: 2579,
					name: "South Carolina",
					final_rank: 1,
					year: 2022,
					week: "1",
					postseason: 0,
				},
				{
					team_id: 2579,
					name: "South Carolina",
					final_rank: 2,
					year: 2022,
					week: "5",
					postseason: 0,
				},
				{
					team_id: 2579,
					name: "South Carolina",
					final_rank: 3,
					year: 2022,
					week: "10",
					postseason: 0,
				},
				{
					team_id: 2579,
					name: "South Carolina",
					final_rank: 4,
					year: 2022,
					week: "Final",
					postseason: 1,
				},
			];
			(getTeamRankingsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const teamRankings = await getTeamRankings(2579);

			expect(getTeamRankingsDB).toBeCalledTimes(1);
			expect(teamRankings).toEqual(mockReturn);
		});
	});

	describe("getUniqueTeams", () => {
		it("passes return through", async () => {
			const mockReturn: Team[] = [
				{
					team_id: 2579,
					name: "South Carolina",
				},
				{
					team_id: 52,
					name: "FSU",
				},
			];
			(getUniqueTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const uniqueTeams = await getUniqueTeams();

			expect(getUniqueTeamsDB).toBeCalledTimes(1);
			expect(uniqueTeams).toEqual(mockReturn);
		});
	});

	describe("allGames", () => {
		it("passes return through", async () => {
			const mockReturn: TeamGames[] = [
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
					team_id: 52,
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
			(allGamesDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const games = await allGames();

			expect(allGamesDB).toBeCalledTimes(1);
			expect(games).toEqual(mockReturn);
		});
	});

	describe("getRankingPathParams", () => {
		let getRankingPathParams: () => Promise<RankingPathParams[]>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				getRankingPathParams = utils.getRankingPathParams;
				expect(getRankingPathParams).not.toBe(undefined);
			});
		});

		it("passes return through", async () => {
			const mockReturn = [
				{
					year: "2022",
					weeks: 3,
					postseason: 1,
				},
			];
			(availableRankingsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected = [
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
				{
					params: {
						division: "fbs",
						year: "2022",
						week: "3",
					},
				},
				{
					params: {
						division: "fbs",
						year: "2022",
						week: "final",
					},
				},
				{
					params: {
						division: "fcs",
						year: "2022",
						week: "1",
					},
				},
				{
					params: {
						division: "fcs",
						year: "2022",
						week: "2",
					},
				},
				{
					params: {
						division: "fcs",
						year: "2022",
						week: "3",
					},
				},
				{
					params: {
						division: "fcs",
						year: "2022",
						week: "final",
					},
				},
			];

			const paths = await getRankingPathParams();

			expect(availableRankingsDB).toBeCalledTimes(1);
			expect(paths).toEqual(expected);
		});
	});

	describe("getTeamPathParams", () => {
		it("returns correct params", async () => {
			const mockReturn: Team[] = [
				{
					team_id: 2579,
					name: "South Carolina",
				},
				{
					team_id: 52,
					name: "FSU",
				},
			];
			(getUniqueTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: TeamPathParams[] = [
				{
					params: {
						team: "2579",
					},
				},
				{
					params: {
						team: "52",
					},
				},
			];

			const paths = await getTeamPathParams();

			expect(getUniqueTeamsDB).toBeCalledTimes(1);
			expect(paths).toEqual(expected);
		});
	});
});
