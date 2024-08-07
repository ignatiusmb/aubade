import { augment } from 'mauss/std';

/**
 * @template {{ slug?: string; title?: any }} T
 * @param {T[]} items
 * @param {{
 * 	base?: string
 * 	breakpoint?(next: T): boolean
 * 	sort?(x: T, y: T): number
 * }} options
 */
export function chain(items, options) {
	const { base = '', breakpoint, sort } = options;

	/**
	 * @typedef {Pick<T, 'slug' | 'title'>} Picked
	 * @typedef {{ back?: Picked; next?: Picked }} Flank
	 * @typedef {{ flank?: Flank }} Attachment
	 */

	sort && items.sort(sort);
	const array = /** @type {Array<T & Attachment>} */ (items);
	const flank = /** @type {const} */ (['slug', 'title']);
	for (let idx = 0; idx < array.length; idx++) {
		const [back, next] = [array[idx - 1], array[idx + 1]];
		if (back) {
			const unwrapped = augment(back).filter(flank);
			unwrapped.slug = base + unwrapped.slug;
			array[idx].flank = { back: unwrapped };
		}
		if (breakpoint && breakpoint(next)) return array;
		if (next) {
			if (!array[idx].flank) array[idx].flank = {};
			const unwrapped = augment(next).filter(flank);
			unwrapped.slug = base + unwrapped.slug;
			// @ts-expect-error - `flank` definitely exists
			array[idx].flank.next = unwrapped;
		}
	}
	return array;
}
