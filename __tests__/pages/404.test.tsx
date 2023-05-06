import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import Custom404 from "@pages/404";

describe("Custom404 page", () => {
	it("renders correctly", async () => {
		const { baseElement } = render(<Custom404 />);
		await screen.findByTitle(/light mode/i);

		expect(baseElement).toMatchSnapshot();
	});
});
