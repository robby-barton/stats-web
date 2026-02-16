import { beforeEach, describe, expect, it } from 'vitest';

async function loadUtils() {
	return await import('./utils.js');
}

beforeEach(() => {
	delete process.env.ELEVENTY_ALL_YEARS;
});

describe('rankings', () => {
	it('builds rankings per year', async () => {
		const utils = await loadUtils();
		utils.setDb({
			availableRankingsDB: async () => [],
			availableTeamsDB: async () => [{ team_id: 1, name: 'Alpha', logo: '', logo_dark: '' }],
			getRankingsForYearDB: async () => [
				{
					team_id: 1,
					conf: 'C1',
					final_rank: 1,
					final_raw: 5.5,
					wins: 10,
					losses: 2,
					ties: 0,
					sos_rank: 2,
					srs_rank: 1,
					week: 1,
					postseason: 0,
				},
			],
			getRankingsForDivisionDB: async () => [],
			getAllTeamRankingsDB: async () => [],
			allGamesDB: async () => [],
		});

		const ranking = await utils.getRanking('cfb', true, 2024, '1');
		expect(ranking).toHaveLength(1);
		expect(ranking[0].team.name).toBe('Alpha');
		expect(ranking[0].record).toBe('10-2');
	});

	it('builds rankings for all years when enabled', async () => {
		process.env.ELEVENTY_ALL_YEARS = '1';
		const utils = await loadUtils();
		utils.setDb({
			availableRankingsDB: async () => [],
			availableTeamsDB: async () => [{ team_id: 7, name: 'Beta', logo: '', logo_dark: '' }],
			getRankingsForDivisionDB: async () => [
				{
					team_id: 7,
					conf: 'C2',
					final_rank: 3,
					final_raw: 9.1,
					wins: 8,
					losses: 4,
					ties: 1,
					sos_rank: 5,
					srs_rank: 6,
					week: 2,
					postseason: 0,
					year: 2023,
				},
			],
			getRankingsForYearDB: async () => [],
			getAllTeamRankingsDB: async () => [],
			allGamesDB: async () => [],
		});

		const ranking = await utils.getRanking('cfb', false, 2023, '2');
		expect(ranking).toHaveLength(1);
		expect(ranking[0].team.name).toBe('Beta');
		expect(ranking[0].record).toBe('8-4-1');
	});

	it('isolates rankings by sport', async () => {
		const utils = await loadUtils();
		utils.setDb({
			availableRankingsDB: async () => [],
			availableTeamsDB: async (sport) => {
				if (sport === 'cbb') {
					return [{ team_id: 10, name: 'Hoops U', logo: '', logo_dark: '' }];
				}
				return [{ team_id: 1, name: 'Gridiron U', logo: '', logo_dark: '' }];
			},
			getRankingsForYearDB: async (sport) => {
				if (sport === 'cbb') {
					return [
						{
							team_id: 10,
							conf: 'B10',
							final_rank: 1,
							final_raw: 8.0,
							wins: 25,
							losses: 5,
							ties: 0,
							sos_rank: 3,
							srs_rank: 2,
							week: 5,
							postseason: 0,
						},
					];
				}
				return [];
			},
			getRankingsForDivisionDB: async () => [],
			getAllTeamRankingsDB: async () => [],
			allGamesDB: async () => [],
		});

		const cbbRanking = await utils.getRanking('cbb', true, 2025, '5');
		expect(cbbRanking).toHaveLength(1);
		expect(cbbRanking[0].team.name).toBe('Hoops U');
		expect(cbbRanking[0].record).toBe('25-5');

		const cfbRanking = await utils.getRanking('cfb', true, 2025, '5');
		expect(cfbRanking).toHaveLength(0);
	});
});

describe('teams', () => {
	it('returns team rankings and ranked teams from a single load', async () => {
		const utils = await loadUtils();
		utils.setDb({
			availableRankingsDB: async () => [],
			availableTeamsDB: async () => [
				{ team_id: 1, name: 'Alpha', logo: '', logo_dark: '' },
				{ team_id: 2, name: 'Gamma', logo: '', logo_dark: '' },
			],
			getAllTeamRankingsDB: async () => [
				{ team_id: 1, final_rank: 5, year: 2020, week: 1, postseason: 0 },
				{ team_id: 2, final_rank: 10, year: 2021, week: 2, postseason: 0 },
			],
			getRankingsForDivisionDB: async () => [],
			getRankingsForYearDB: async () => [],
			allGamesDB: async () => [],
		});

		const alphaRanks = await utils.getTeamRankings(1);
		const teams = await utils.getRankedTeams();

		expect(alphaRanks).toHaveLength(1);
		expect(alphaRanks[0].team.name).toBe('Alpha');
		expect(teams.map((team) => team.name)).toEqual(['Alpha', 'Gamma']);
	});
});
