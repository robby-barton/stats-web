import Head from 'next/head';
import Link from 'next/link';
import Header from './header';
import Footer from './footer';
import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';

export const siteTitle = 'Robby\'s Ranking';

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width" />
      </Head>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
