import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import { AvailRanks, Rank } from "@lib/types";
import Week from "@pages/ranking/[division]/[year]/[week]";

jest.mock("next/router", () => ({
	useRouter: jest.fn(),
}));

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
		await screen.findByTitle(/light mode/i);

		expect(baseElement).toMatchSnapshot();
	});
});
