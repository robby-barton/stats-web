import Link from 'next/link';

export default async function NotFound() {
	return (
		<div>
			<h1>Page not found</h1>
			<Link href="/">Return Home</Link>
		</div>
	);
}
