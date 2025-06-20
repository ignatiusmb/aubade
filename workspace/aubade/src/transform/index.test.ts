import { chain } from './chain.js';

declare function expect<T>(v: T): void;

(/* chain */) => {
	const posts = [
		{ slug: 'a', title: 'A' },
		{ slug: 'b', title: 'B' },
	];

	const flank = chain(posts, {
		transform: (p) => ({ label: p.title.toUpperCase() }),
	});

	expect<undefined | { label: string }>(flank[0].flank.back);
	expect<undefined | { label: string }>(flank[0].flank.next);

	const links = chain(posts, {
		key: 'links',
		transform: (p) => ({ label: p.title.toUpperCase() }),
	});

	expect<undefined | { label: string }>(links[0].links.back);
	expect<undefined | { label: string }>(links[0].links.next);
};
