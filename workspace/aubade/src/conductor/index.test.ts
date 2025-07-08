import { orchestrate } from './index.js';

declare function expect<T>(v: T): void;

async (/* traverse */) => {
	expect<Record<string, any>>(await orchestrate('.'));

	const [item] = await orchestrate('.', ({ breadcrumb: [, slug] }) => {
		if (!slug.endsWith('.md')) return;
		return async ({ buffer, marker, parse }) => {
			const { body, frontmatter } = parse(buffer.toString('utf-8'));
			if (!frontmatter) return;
			return {
				...frontmatter,
				hello: 'world',
				content: marker.render(body),
			};
		};
	});

	expect<number>(item.estimate);
	expect<string>(item.table[0].id);
	expect<string>(item.table[0].title);
	expect<number>(item.table[0].level);

	expect<string>(item.hello);
	expect<string>(item.content);
};
