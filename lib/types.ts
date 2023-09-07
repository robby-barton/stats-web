/* istanbul ignore file */

export type YearRanks = {
	weeks: number;
	postseason: boolean;
};

export type AvailRanks = {
	[index: string]: YearRanks;
};

export type Team = {
	team_id: number;
	name: string;
	logo: string;
	logo_dark: string;
};

export type AvailTeams = {
	[index: string]: Team;
};

export type Rank = {
	team: Team;
	conf: string;
	record: string;
	srs_rank: number;
	sos_rank: number;
	final_raw: number;
	final_rank: number;
};

export type TeamRank = {
	team: Team;
	final_rank: number;
	year: number;
	week: string;
	postseason: number;
};

export type TeamGames = {
	team: Team;
	sun: number;
	mon: number;
	tue: number;
	wed: number;
	thu: number;
	fri: number;
	sat: number;
	total: number;
};

export type RankingPath = {
	division: string;
	year: string;
	week: string;
};

export type TeamPath = {
	team: string;
};

export type ChartPoint = {
	week: string;
	rank: number;
	fillLevel: number;
};
