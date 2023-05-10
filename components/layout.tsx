import { PropsWithChildren } from "react";

import Head from "next/head";

import Footer from "@components/footer";
import Header from "@components/header";
import styles from "@components/layout.module.css";
import { ThemeProvider } from "@components/themeProvider";

export default function Layout({ children }: PropsWithChildren) {
	return (
		<ThemeProvider>
			<div className={styles.container}>
				<Head>
					<link rel="icon" href="/favicon.ico" />
					<meta name="viewport" content="width=device-width, height=device-height" />
				</Head>
				<Header />
				<div className={styles.contentWrap}>{children}</div>
				<Footer />
			</div>
		</ThemeProvider>
	);
}
