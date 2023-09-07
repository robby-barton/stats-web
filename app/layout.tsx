import { ServerThemeProvider } from 'next-themes';

import Layout from '@components/layout';
import '@styles/globals.css';

import { Providers } from './provider';

export default function RootLayout({
	// Layouts must accept a children prop.
	// This will be populated with nested layouts or pages
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ServerThemeProvider>
			<html lang="en" suppressHydrationWarning>
				<head>
					<link rel="icon" href="/favicon.ico" />
					<meta name="viewport" content="width=device-width, height=device-height" />
				</head>
				<body>
					<Providers>
						<Layout>{children}</Layout>
					</Providers>
				</body>
			</html>
		</ServerThemeProvider>
	);
}
