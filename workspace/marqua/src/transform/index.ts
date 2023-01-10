import type { Primitives } from 'mauss/typings';
import { ntv } from 'mauss/std';

export { pipe } from 'mauss';

type Narrowable = Primitives | symbol | object | undefined | void | null | {};
type Fallback<A, B> = A extends B ? A : B;
type Narrow<T> = Fallback<
	T,
	[] | (T extends Narrowable ? T : never) | { [K in keyof T]: Narrow<T[K]> }
>;

// TODO remove once merged - https://github.com/alchemauss/mauss/pull/199
function pick<T extends readonly string[]>(keys: Narrow<T>) {
	const props = new Set(keys);
	return (o: { [K in T[number]]?: any }) => {
		return ntv.iterate(o, ([k, v]) => props.has(k) && [k, v]);
	};
}

interface ChainOptions<T> {
	base?: string;
	breakpoint?: (next: T) => boolean;
}
export function chain<T extends { slug: string; title: string; [k: string]: any }>({
	base = '',
	breakpoint,
}: ChainOptions<T>) {
	type Attachment = { flank?: { back?: T; next?: T } };
	return (items: T[]): Array<T & Attachment> => {
		const array: Array<T & Attachment> = items;
		const unwrap = pick(['slug', 'title']);
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
