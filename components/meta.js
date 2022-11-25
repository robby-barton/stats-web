import Head from 'next/head';

export default function Meta({ desc }) {
  return (
    <Head>
      <meta name="description" content={desc} />
    </Head>
  );
}
