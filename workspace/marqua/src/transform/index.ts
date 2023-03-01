import { ntv } from 'mauss/std';

export { pipe } from 'mauss';

export function chain<T extends { slug?: string; title?: any }>(options: {
	base?: string;
	breakpoint?: (next: T) => boolean;
	sort?: (x: T, y: T) => number;
}) {
	const { base = '', breakpoint, sort } = options;

	type Picked = Pick<T, 'slug' | 'title'>;
	type Flank = { back?: Picked; next?: Picked };
	type Attachment = { flank?: Flank };

	return (items: T[]): Array<T & Attachment> => {
		if (sort) items = items.sort(sort);
		const array: Array<T & Attachment> = items;
		const unwrap = ntv.pick(['slug', 'title']);
		for (let idx = 0; idx < array.length; idx++) {
			const [back, next] = [array[idx - 1], array[idx + 1]];
			if (back) {
				const unwrapped = unwrap(back) as T;
				unwrapped.slug = base + unwrapped.slug;
				array[idx].flank = { back: unwrapped };
			}
			if (breakpoint && breakpoint(next)) return array;
			if (next) {
				if (!array[idx].flank) array[idx].flank = {};
				const unwrapped = unwrap(next) as T;
				unwrapped.slug = base + unwrapped.slug;
				array[idx].flank!.next = unwrapped;
			}
		}
		return array;
	};
}
