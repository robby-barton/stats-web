import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import { ThemeProvider } from "@components/themeProvider";
import ThemeToggle from "@components/themeToggle";

beforeEach(() => {
	document.body.dataset.theme = "light";
});

describe("ThemeToggle", () => {
	it("changes theme", () => {
		render(
			<ThemeProvider>
				<ThemeToggle />
			</ThemeProvider>
		);
		const themeToggle = screen.getByRole("button");

		fireEvent.click(themeToggle);
		expect(document.body.dataset.theme).toEqual("dark");
	});
});
