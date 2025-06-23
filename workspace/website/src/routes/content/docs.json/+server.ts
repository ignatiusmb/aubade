import { json } from '@sveltejs/kit';
import { DATA, type Items } from '$content/builder';

export const prerender = true;

export interface Schema {
	items: Items['docs/'];
	metadata: {
		pages: Array<{ slug: string; title: string }>;
	};
}

export async function GET() {
	const items = await DATA['docs/']();
	const metadata = {
		pages: items.map((i) => ({ slug: i.slug, title: i.title })),
	};

	return json({ items, metadata } satisfies Schema);
}
