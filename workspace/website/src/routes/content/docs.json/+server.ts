import { json } from '@sveltejs/kit';
import { DATA } from '$lib/content';

export const prerender = true;

export interface Schema {
	items: (typeof DATA)['docs/'];
	metadata: {
		pages: Array<{ slug: string; title: string }>;
	};
}

export async function GET() {
	const items = DATA['docs/'];
	const metadata = {
		pages: items.map((i) => ({ slug: i.slug, title: i.title })),
	};

	return json({ items, metadata } satisfies Schema);
}
