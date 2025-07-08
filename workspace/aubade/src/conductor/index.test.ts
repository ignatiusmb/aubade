import { orchestrate } from './index.js';

declare function expect<T>(v: T): void;

async (/* traverse */) => {
	expect<Record<string, any>>(await orchestrate('.'));

	const [item] = await orchestrate('.', ({ breadcrumb: [, slug] }) => {
		if (!slug.endsWith('.md')) return;
		return async ({ assemble, buffer }) => {
			const { manifest, md, meta } = assemble(buffer.toString('utf-8'));
			if (!manifest) return;
			return {
				...manifest,
				words: meta.words,
				content: md.html(),
			};
		};
	});

	expect<number>(item.words);
	expect<string>(item.content);
};
