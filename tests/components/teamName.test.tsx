import { useContext } from "react";

import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import TeamName from "@components/teamName";
import { ThemeContext, ThemeProvider } from "@components/themeProvider";
import { ERROR_IMAGES } from "@lib/constants";

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

function TestTeamName({ team_id, name }: { team_id: number; name: string }) {
	const { setColorMode } = useContext(ThemeContext);

	return (
		<div>
			<button onClick={() => setColorMode("dark")} aria-label="dark">
				Dark Mode
			</button>
			<TeamName team_id={team_id} name={name} />
		</div>
	);
}

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

		expect(img.src).toContain(ERROR_IMAGES[team_id % ERROR_IMAGES.length].src.replace("/", ""));
	});

	it("changes to dark", async () => {
		render(
			<ThemeProvider>
				<TestTeamName team_id={2579} name="South Carolina" />
			</ThemeProvider>
		);
		const img = (await screen.findByAltText("South Carolina")) as HTMLImageElement;

		expect(img.src).not.toContain("dark");

		fireEvent.click(screen.getByRole("button", { name: "dark" }));

		expect(img.src).toContain("dark");
	});
});
