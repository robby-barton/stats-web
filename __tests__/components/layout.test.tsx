import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import Layout from "@components/layout";

describe("Layout", () => {
	it("renders correctly", async () => {
		const { baseElement } = render(<Layout />);
		await screen.findByTitle(/light mode/i);

		expect(baseElement).toMatchSnapshot();
	});
});
