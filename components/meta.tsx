import Head from "next/head";

type MetaProps = {
	desc: string;
};
export default function Meta({ desc }: MetaProps) {
	return (
		<Head>
			<meta name="description" content={desc} />
		</Head>
	);
}
