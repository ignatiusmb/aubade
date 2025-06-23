import { traverse } from './index.js';

declare function expect<T>(v: T): void;

interface Metadata {
	estimate: number;
	table: Array<{
		id: string;
		title: string;
		level: number;
	}>;
}

async (/* traverse */) => {
	expect<Record<string, any>>(await traverse('.'));

	const transformed = await traverse('.', ({ breadcrumb: [, slug] }) => {
		if (!slug.endsWith('.md')) return;
		return async ({ buffer, marker, parse }) => {
			const { body, metadata } = parse(buffer.toString('utf-8'));
			if (!metadata) return;
			return {
				hello: 'world',
				...metadata,
				content: marker.render(body),
			};
		};
	});

	expect<Metadata & { content: string; hello: string }>(transformed[0]);
};
