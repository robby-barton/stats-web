import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
	const { secret } = await req.json();

	if (secret === process.env.REVALIDATE_SECRET) {
		revalidatePath('/');
	} else {
		return new Response('invalid secret', { status: 401 });
	}

	return new Response('', { status: 200 });
}
