import { createRoot } from 'react-dom/client';

import ThemeToggle from '@components/themeToggle';
import { ThemeProvider } from '@components/themeProvider';

const root = document.getElementById('theme-toggle-root');

if (root) {
	createRoot(root).render(
		<ThemeProvider>
			<ThemeToggle />
		</ThemeProvider>,
	);
}
