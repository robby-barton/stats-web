import Head from 'next/head';
import Layout from '../components/layout';
import Title from '../components/title';
import utilStyles from '../styles/utils.module.css';

export default function Home() {
  return (
    <Layout home>
      <Title />
      <section className={utilStyles.headingMd}>
        <p>Robby's Ranking</p>
        <p>
          (This is a sample website - you’ll be building a site like this on{' '}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
      </section>
    </Layout>
  );
}
