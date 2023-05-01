import Head from 'next/head';
import Header from './header';
import Footer from './footer';
import styles from './layout.module.css';

export const siteTitle = 'Robby\'s Ranking';

export default function Layout({ children }) {
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
