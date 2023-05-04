import { PropsWithChildren } from 'react';
import Head from 'next/head';
import Header from './header';
import Footer from './footer';
import styles from './layout.module.css';

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div className={styles.container}>
			<Head>
				<link rel="icon" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, height=device-height" />
			</Head>
			<Header />
			<div className={styles.contentWrap}>
				{children}
			</div>
			<Footer />
		</div>
	);
}
