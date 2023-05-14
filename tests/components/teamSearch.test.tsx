import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import TeamSearch from "@components/teamSearch";
import { ThemeProvider } from "@components/themeProvider";
import { Team } from "@lib/types";

beforeEach(() => {
	const mockIntersectionObserver = jest.fn();
	mockIntersectionObserver.mockReturnValue({
		observe: () => null,
		unobserve: () => null,
		disconnect: () => null,
	});
	window.IntersectionObserver = mockIntersectionObserver;
});

const scInfo: Team = {
	team_id: 2579,
	name: "South Carolina",
	logo: "/logo/south-carolina.png",
	logo_dark: "/logo-dark/south-carolina.png",
};

const fsuInfo: Team = {
	team_id: 52,
	name: "Florida State",
	logo: "/logo/florida-state.png",
	logo_dark: "/logo-dark/florida-state.png",
};

describe("TeamSearch", () => {
	it("works", () => {
		const teams: Team[] = [scInfo, fsuInfo];
		render(
			<ThemeProvider>
				<TeamSearch teams={teams} />
			</ThemeProvider>
		);

		const team = screen.getByText("South Carolina");
		expect(team).toBeInTheDocument();

		fireEvent.change(screen.getByRole("searchbox"), { target: { value: "FSU" } });
		expect(team).not.toBeInTheDocument();
	});
});
