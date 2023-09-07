import { PropsWithChildren } from 'react';

import Footer from '@components/footer';
import Header from '@components/header';

import styles from '@components/layout.module.css';

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div className={styles.container}>
			<Header />
			<div className={styles.contentWrap}>{children}</div>
			<Footer />
		</div>
	);
}
