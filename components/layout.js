import Head from 'next/head';
import Link from 'next/link';
import Header from './header';
import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';

export const siteTitle = 'Robby\'s Ranking';

export default function Layout({ children, home }) {
  return (
    <div>
      <Header />
      <div className={styles.container}>
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>{children}</main>
        {!home && (
          <div className={styles.backToHome}>
            <Link href="/">← Go to current rankings</Link>
          </div>
        )}
      </div>
    </div>
  );
}
