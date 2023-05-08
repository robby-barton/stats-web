import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import About from "@pages/about";

describe("About page", () => {
	it("renders correctly", async () => {
		const { baseElement } = render(<About />);
		await screen.findByTitle(/light mode/i);

		expect(baseElement).toMatchSnapshot();
	});
});
