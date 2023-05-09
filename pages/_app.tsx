/* istanbul ignore file */

import type { AppProps } from "next/app";

import { ThemeProvider } from "@components/themeProvider";
import "@styles/globals.css";

function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider>
			<Component {...pageProps} />;
		</ThemeProvider>
	);
}

export default App;
