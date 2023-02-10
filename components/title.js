import Head from 'next/head';
import { siteTitle } from './layout';

export default function Title({ title }) {
  let titleText = siteTitle
  if (title) {
    titleText = siteTitle + " - " + title
  }
  return (
    <Head>
      <title>{titleText}</title>
    </Head>
  );
}
