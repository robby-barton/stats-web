import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import Custom500 from "@pages/500";

describe("Custom500 page", () => {
	it("renders correctly", async () => {
		const { baseElement } = render(<Custom500 />);
		await screen.findByTitle(/light mode/i);

		expect(baseElement).toMatchSnapshot();
	});
});
