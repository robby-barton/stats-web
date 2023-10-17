export async function fetcher<JSON>(input: RequestInfo): Promise<JSON> {
	const res = await fetch(input);
	return res.json();
}
