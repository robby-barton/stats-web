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
};

export type Rank = {
	team_id: number;
	name: string;
	conf: string;
	record: string;
	srs_rank: number;
	sos_rank: number;
	final_raw: number;
	final_rank: number;
};

export type TeamRank = {
	team_id: number;
	name: string;
	final_rank: number;
	year: number;
	week: string;
	postseason: number;
};

export type TeamGames = {
	name: string;
	team_id: number;
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

export type RankingPathParams = {
	params: RankingPath;
};

export type TeamPath = {
	team: string;
};

export type TeamPathParams = {
	params: TeamPath;
};

export type ChartPoint = {
	week: string;
	rank: number;
	fillLevel: number;
};
