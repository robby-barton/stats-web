import '@testing-library/jest-dom';

import {
	allGamesDB,
	availableRankingsDB,
	availableTeamsDB,
	getRankedTeamsDB,
	getRankingDB,
	getTeamRankingsDB,
} from '@lib/dbFuncs';
import { AvailRanks, AvailTeams, Rank, RankingPathParams, Team, TeamGames, TeamPathParams, TeamRank } from '@lib/types';

jest.mock('@lib/dbFuncs', () => ({
	__esModule: true,
	availableRankingsDB: jest.fn(),
	availableTeamsDB: jest.fn(),
	getRankingDB: jest.fn(),
	getTeamRankingsDB: jest.fn(),
	getUniqueTeamsDB: jest.fn(),
	allGamesDB: jest.fn(),
	getRankedTeamsDB: jest.fn(),
}));

afterAll(() => {
	jest.unmock('@lib/dbFuncs');
});

afterEach(() => {
	jest.clearAllMocks();
});

const scInfo: Team = {
	team_id: 2579,
	name: 'South Carolina',
	logo: '/logo/south-carolina.png',
	logo_dark: '/logo-dark/south-carolina.png',
};

const fsuInfo: Team = {
	team_id: 52,
	name: 'Florida State',
	logo: '/logo/florida-state.png',
	logo_dark: '/logo-dark/florida-state.png',
};

describe('utils', () => {
	describe('availableRankings', () => {
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

		it('throws error if empty return', async () => {
			(availableRankingsDB as jest.Mock).mockReturnValue(Promise.resolve([]));

			await expect(availableRankings()).rejects.toThrow(Error('Not found'));
			expect(availableRankingsDB).toBeCalledTimes(1);
		});

		it('returns correct values', async () => {
			const mockReturn = [
				{
					year: '2022',
					weeks: 16,
					postseason: 0,
				},
			];
			(availableRankingsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: AvailRanks = {
				'2022': {
					weeks: 16,
					postseason: false,
				},
			};

			const avail = await availableRankings();

			expect(availableRankingsDB).toBeCalledTimes(1);
			expect(avail).toEqual(expected);
		});

		it('returns consecutive correct values', async () => {
			const mockReturn = [
				{
					year: '2022',
					weeks: 16,
					postseason: 1,
				},
			];
			(availableRankingsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: AvailRanks = {
				'2022': {
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

	describe('availableTeams', () => {
		// availableTeams uses and internal variable to only update
		// the available rankings every 5 minutes, so re-import for each
		// test to ensure it doesn't pollute the testing
		let availableTeams: () => Promise<AvailTeams>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				availableTeams = utils.availableTeams;
				expect(availableTeams).not.toBe(undefined);
			});
		});

		it('throws error if empty return', async () => {
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve([]));

			await expect(availableTeams()).rejects.toThrow(Error('Not found'));
			expect(availableTeamsDB).toBeCalledTimes(1);
		});

		it('returns correct values', async () => {
			const mockReturn = [scInfo, fsuInfo];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: AvailTeams = {
				'2579': scInfo,
				'52': fsuInfo,
			};

			const avail = await availableTeams();

			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(avail).toEqual(expected);
		});

		it('returns consecutive correct values', async () => {
			const mockReturn = [scInfo, fsuInfo];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: AvailTeams = {
				'2579': scInfo,
				'52': fsuInfo,
			};

			const avail = await availableTeams();
			const avail2 = await availableTeams();

			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(avail).toEqual(expected);
			expect(avail).toEqual(avail2);
		});

		it('handles null logos', async () => {
			const mockReturn = [
				{
					team_id: 2579,
					name: 'South Carolina',
					logo: null,
					logo_dark: null,
				},
			];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: AvailTeams = {
				'2579': {
					team_id: 2579,
					name: 'South Carolina',
					logo: '',
					logo_dark: '',
				},
			};

			const avail = await availableTeams();

			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(avail).toEqual(expected);
		});
	});

	describe('getRanking', () => {
		let getRanking: (div: boolean, year: number, week: string) => Promise<Rank[]>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				getRanking = utils.getRanking;
				expect(getRanking).not.toBe(undefined);
			});
		});

		it('converts db return to Rank', async () => {
			const mockReturn = [
				{
					team_id: 2579,
					conf: 'SEC',
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
			const teamMock: Team[] = [scInfo, fsuInfo];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(teamMock));

			const expected: Rank[] = [
				{
					team: scInfo,
					conf: 'SEC',
					final_rank: 1,
					final_raw: 0.123456789,
					record: '8-5',
					sos_rank: 2,
					srs_rank: 3,
				},
			];

			const ranking = await getRanking(true, 2022, 'Final');

			expect(getRankingDB).toBeCalledTimes(1);
			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(ranking).toEqual(expected);
		});

		it('converts db return to Rank with tie', async () => {
			const mockReturn = [
				{
					team_id: 2579,
					conf: 'SEC',
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
			const teamMock: Team[] = [scInfo, fsuInfo];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(teamMock));

			const expected: Rank[] = [
				{
					team: scInfo,
					conf: 'SEC',
					final_rank: 1,
					final_raw: 0.123456789,
					record: '8-5-1',
					sos_rank: 2,
					srs_rank: 3,
				},
			];

			const ranking = await getRanking(true, 2022, 'Final');

			expect(getRankingDB).toBeCalledTimes(1);
			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(ranking).toEqual(expected);
		});
	});

	describe('getTeamRankings', () => {
		let getTeamRankings: (team: number) => Promise<TeamRank[]>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				getTeamRankings = utils.getTeamRankings;
				expect(getTeamRankings).not.toBe(undefined);
			});
		});

		it('hydrates team info', async () => {
			const mockReturn = [
				{
					team_id: 2579,
					final_rank: 1,
					year: 2022,
					week: '1',
					postseason: 0,
				},
				{
					team_id: 2579,
					final_rank: 2,
					year: 2022,
					week: '5',
					postseason: 0,
				},
				{
					team_id: 2579,
					final_rank: 3,
					year: 2022,
					week: '10',
					postseason: 0,
				},
				{
					team_id: 2579,
					final_rank: 4,
					year: 2022,
					week: 'Final',
					postseason: 1,
				},
			];
			(getTeamRankingsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));
			const teamMock: Team[] = [scInfo, fsuInfo];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(teamMock));

			const expected: TeamRank[] = [
				{
					team: scInfo,
					final_rank: 1,
					year: 2022,
					week: '1',
					postseason: 0,
				},
				{
					team: scInfo,
					final_rank: 2,
					year: 2022,
					week: '5',
					postseason: 0,
				},
				{
					team: scInfo,
					final_rank: 3,
					year: 2022,
					week: '10',
					postseason: 0,
				},
				{
					team: scInfo,
					final_rank: 4,
					year: 2022,
					week: 'Final',
					postseason: 1,
				},
			];
			const teamRankings = await getTeamRankings(2579);

			expect(getTeamRankingsDB).toBeCalledTimes(1);
			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(teamRankings).toEqual(expected);
		});
	});

	describe('allGames', () => {
		let allGames: () => Promise<TeamGames[]>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				allGames = utils.allGames;
				expect(allGames).not.toBe(undefined);
			});
		});

		it('hydrates team info', async () => {
			const mockReturn = [
				{
					team_id: 2579,
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
			const teamMock: Team[] = [scInfo, fsuInfo];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(teamMock));

			const expected: TeamGames[] = [
				{
					team: scInfo,
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
					team: fsuInfo,
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
			const games = await allGames();

			expect(allGamesDB).toBeCalledTimes(1);
			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(games).toEqual(expected);
		});

		it('strips non-existent teams', async () => {
			const mockReturn = [
				{
					team_id: 2579,
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
					team_id: 100000,
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
			const teamMock: Team[] = [scInfo, fsuInfo];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(teamMock));

			const expected: TeamGames[] = [
				{
					team: scInfo,
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
					team: fsuInfo,
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
			const games = await allGames();

			expect(allGamesDB).toBeCalledTimes(1);
			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(games).toEqual(expected);
		});
	});

	describe('getRankingPathParams', () => {
		let getRankingPathParams: () => Promise<RankingPathParams[]>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				getRankingPathParams = utils.getRankingPathParams;
				expect(getRankingPathParams).not.toBe(undefined);
			});
		});

		it('returns params', async () => {
			const mockReturn = [
				{
					year: '2022',
					weeks: 3,
					postseason: 1,
				},
			];
			(availableRankingsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected = [
				{
					params: {
						division: 'fbs',
						year: '2022',
						week: '1',
					},
				},
				{
					params: {
						division: 'fbs',
						year: '2022',
						week: '2',
					},
				},
				{
					params: {
						division: 'fbs',
						year: '2022',
						week: '3',
					},
				},
				{
					params: {
						division: 'fbs',
						year: '2022',
						week: 'final',
					},
				},
				{
					params: {
						division: 'fcs',
						year: '2022',
						week: '1',
					},
				},
				{
					params: {
						division: 'fcs',
						year: '2022',
						week: '2',
					},
				},
				{
					params: {
						division: 'fcs',
						year: '2022',
						week: '3',
					},
				},
				{
					params: {
						division: 'fcs',
						year: '2022',
						week: 'final',
					},
				},
			];

			const paths = await getRankingPathParams();

			expect(availableRankingsDB).toBeCalledTimes(1);
			expect(paths).toEqual(expected);
		});
	});

	describe('getTeamPathParams', () => {
		let getTeamPathParams: () => Promise<TeamPathParams[]>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				getTeamPathParams = utils.getTeamPathParams;
				expect(getTeamPathParams).not.toBe(undefined);
			});
		});

		it('returns correct params', async () => {
			const mockReturn = [{ team_id: 2579 }];
			(getRankedTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));

			const expected: TeamPathParams[] = [
				{
					params: {
						team: scInfo.team_id.toString(),
					},
				},
			];

			const paths = await getTeamPathParams();

			expect(getRankedTeamsDB).toBeCalledTimes(1);
			expect(paths).toEqual(expected);
		});
	});

	describe('getRankedTeams', () => {
		let getRankedTeams: () => Promise<Team[]>;
		beforeEach(() => {
			jest.isolateModules(() => {
				const utils = require("@lib/utils"); // eslint-disable-line
				getRankedTeams = utils.getRankedTeams;
				expect(getRankedTeams).not.toBe(undefined);
			});
		});

		it('returns teams', async () => {
			const mockReturn = [{ team_id: 2579 }];
			(getRankedTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(mockReturn));
			const mockTeams: Team[] = [scInfo];
			(availableTeamsDB as jest.Mock).mockReturnValue(Promise.resolve(mockTeams));

			const teams = await getRankedTeams();

			expect(getRankedTeamsDB).toBeCalledTimes(1);
			expect(availableTeamsDB).toBeCalledTimes(1);
			expect(teams).toEqual([scInfo]);
		});
	});
});
