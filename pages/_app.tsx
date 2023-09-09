/* istanbul ignore file */

import type { AppProps } from 'next/app';

import '@styles/globals.css';
import { ThemeProvider } from '@components/themeProvider';

function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider>
			<Component {...pageProps} />
		</ThemeProvider>
	);
}

export default App;
