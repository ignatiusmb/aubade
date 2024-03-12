import { ntv } from 'mauss/std';

export { pipe } from 'mauss';

/**
 * @template {{ slug?: string; title?: any }} T
 * @param {{
 * 	base?: string
 * 	breakpoint?(next: T): boolean
 * 	sort?(x: T, y: T): number
 * }} options
 * @returns
 */
export function chain(options) {
	const { base = '', breakpoint, sort } = options;

	/**
	 * @typedef {Pick<T, 'slug' | 'title'>} Picked
	 * @typedef {{ back?: Picked; next?: Picked }} Flank
	 * @typedef {{ flank?: Flank }} Attachment
	 */

	/** @type {(items: T[]) => Array<T & Attachment>} */
	return (items) => {
		if (sort) items = items.sort(sort);
		const array = /** @type {Array<T & Attachment>} */ (items);
		const unwrap = ntv.pick(['slug', 'title']);
		for (let idx = 0; idx < array.length; idx++) {
			const [back, next] = [array[idx - 1], array[idx + 1]];
			if (back) {
				const unwrapped = unwrap(back);
				unwrapped.slug = base + unwrapped.slug;
				array[idx].flank = { back: unwrapped };
			}
			if (breakpoint && breakpoint(next)) return array;
			if (next) {
				if (!array[idx].flank) array[idx].flank = {};
				const unwrapped = unwrap(next);
				unwrapped.slug = base + unwrapped.slug;
				// @ts-expect-error - `flank` definitely exists
				array[idx].flank.next = unwrapped;
			}
		}
		return array;
	};
}
