import Head from "next/head";

import { SITE_TITLE } from "@lib/constants";

type Props = {
	title?: string;
};

export default function Title({ title }: Props) {
	let titleText = SITE_TITLE;
	if (title) {
		titleText = SITE_TITLE + " - " + title;
	}
	return (
		<Head>
			<title>{titleText}</title>
		</Head>
	);
}
