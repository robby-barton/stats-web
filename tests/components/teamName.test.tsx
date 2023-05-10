import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import TeamName from "@components/teamName";
import { ThemeProvider } from "@components/themeProvider";
import { ERROR_IMAGES } from "@lib/constants";

beforeEach(() => {
	document.body.dataset.theme = "light";
});

describe("TeamName", () => {
	it("errors to a dog img", async () => {
		const team_id = 2579;
		render(
			<ThemeProvider>
				<TeamName team_id={team_id} name="South Carolina" />
			</ThemeProvider>
		);
		const img = (await screen.findByAltText("South Carolina")) as HTMLImageElement;

		fireEvent.error(img);

		expect(img.src).toContain(ERROR_IMAGES[team_id % ERROR_IMAGES.length]);
	});
});
