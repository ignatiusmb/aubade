import { chain } from './chain.js';

declare function expect<T>(v: T): void;

(/* chain */) => {
	const posts = [
		{ slug: 'a', title: 'A', series: 'x' as const },
		{ slug: 'b', title: 'B', series: 'x' as const },
		{ slug: 'c', title: 'C', series: 'y' as const },
	];

	() => {
		const [post] = chain(posts, {
			transform: (p) => ({ label: p.title.toUpperCase() }),
		});

		expect<undefined | { label: string }>(post.flank.back);
		expect<undefined | { label: string }>(post.flank.next);
	};

	() => {
		const [post] = chain(posts, {
			key: 'links',
			transform: (p) => ({ label: p.title.toUpperCase() }),
		});

		expect<undefined | { label: string }>(post.links.back);
		expect<undefined | { label: string }>(post.links.next);
	};

	() => {
		const [post] = chain(posts, {
			group: (p) => p.series,
			sorter: (g) => {
				const key = g === 'x' ? 'slug' : 'title';
				return (x, y) => x[key].localeCompare(y[key]);
			},
			transform: (p) => ({ slug: p.slug, title: p.title }),
			finalize: (groups) => groups['default'].map(({ slug, flank }) => ({ slug, flank })),
		});

		expect<string>(post.slug);
		expect<undefined | {}>(post.flank.back);
		if (post.flank.back) {
			expect<string>(post.flank.back.slug);
			expect<string>(post.flank.back.title);
		}

		// @ts-expect-error - `title` is removed in `finalize`
		expect<string>(post.title);
	};
};
