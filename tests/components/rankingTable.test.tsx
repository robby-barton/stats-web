import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/router";

import RankingTable from "@components/rankingTable";
import { ThemeProvider } from "@components/themeProvider";
import { Rank } from "@lib/types";

jest.mock("next/router", () => ({
	__esModule: true,
	useRouter: jest.fn(),
}));

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

describe("Ranking Table", () => {
	it("link to team works", () => {
		const mockRouter = {
			push: jest.fn(),
		};
		const ranks: Rank[] = [
			{
				team_id: 2579,
				name: "South Carolina",
				conf: "SEC",
				final_raw: 0.1234567,
				final_rank: 1,
				sos_rank: 1,
				srs_rank: 1,
				record: "record",
			},
		];
		(useRouter as jest.Mock).mockReturnValue(mockRouter);

		render(
			<ThemeProvider>
				<RankingTable teams={ranks} />
			</ThemeProvider>
		);

		fireEvent.click(screen.getByText("South Carolina"));
		expect(mockRouter.push).toHaveBeenCalledWith(`/team/${ranks[0].team_id}`);
	});

	it("sorts", () => {
		const ranks: Rank[] = [
			{
				team_id: 2579,
				name: "South Carolina",
				conf: "SEC",
				final_raw: 0.1234567,
				final_rank: 1,
				sos_rank: 1,
				srs_rank: 1,
				record: "record",
			},
			{
				team_id: 52,
				name: "FSU",
				conf: "SEC",
				final_raw: 0.7654321,
				final_rank: 2,
				sos_rank: 2,
				srs_rank: 2,
				record: "record",
			},
		];

		render(
			<ThemeProvider>
				<RankingTable teams={ranks} />
			</ThemeProvider>
		);
		const sc = screen.getByText("South Carolina");
		const fsu = screen.getByText("FSU");

		expect(sc.compareDocumentPosition(fsu)).toBe(4);

		fireEvent.click(screen.getByText("Team"));
		expect(sc.compareDocumentPosition(fsu)).toBe(2);
	});
});
