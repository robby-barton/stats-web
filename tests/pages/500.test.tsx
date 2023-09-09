import { render } from '@testing-library/react';

import '@testing-library/jest-dom';
import Custom500 from '@pages/500';

describe('Custom500 page', () => {
	it('renders correctly', async () => {
		const { baseElement } = render(<Custom500 />);

		expect(baseElement).toMatchSnapshot();
	});
});
