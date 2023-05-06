import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import { ChartPoint } from "@lib/types";
import Team from "@pages/team/[team]";

describe("Team page", () => {
	it("renders correctly", async () => {
		const rankList: ChartPoint[] = [
			{
				week: "1",
				rank: 1,
				fillLevel: 25,
			},
		];
		const { baseElement } = render(<Team team="South Carolina" rankList={rankList} years={[2022, 2023]} />);
		await screen.findByTitle(/light mode/i);

		expect(baseElement).toMatchSnapshot();
	});
});
