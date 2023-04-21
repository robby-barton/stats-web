import Layout from '../components/layout';
import Title from '../components/title';
import Meta from '../components/meta';
import Ranking from '../components/ranking';
import { availableRankings, getRanking } from '../lib/utils';

export default function Home({ rankList, fbs, year, week }) {
  return (
    <Layout>
      <Title />
      <Meta desc="Computer rankings for to FBS and FCS college football seasons." />
      <Ranking 
        rankList={rankList}
        teamList={fbs}
        division={'fbs'}
        year={year}
        week={week}
      />
    </Layout>
  );
}

export async function getStaticProps() {
  const avail = await availableRankings()
  let year = 0
  for (let key in avail) {
    if (key > year) {
      year = key
    }
  }

  const currYear = avail[year]

  const fbs = await getRanking(true, year,
    currYear.postseason ? 'final' : currYear.weeks.toString())

  return {
    props: {
      rankList: avail,
      fbs: fbs,
      year: year,
      week: currYear.postseason ? 'final' : currYear.weeks.toString()
    },
    revalidate: 60,
  }
}
