import { Metadata } from 'next';

import { SITE_TITLE } from '@lib/constants';

export const metadata: Metadata = {
	title: SITE_TITLE + ' - About',
	description: 'Computer rankings for to FBS and FCS college football seasons.',
};

export default function About() {
	return <></>;
}
