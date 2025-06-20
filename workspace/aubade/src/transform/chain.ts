export function chain<
	Item extends Record<string, any>,
	Key extends string = 'flank',
	Output = { slug?: string; title?: any },
>(
	items: Item[],
	options: {
		breakpoint?(next: Item): boolean;
		key?: Key;
		sort?(x: Item, y: Item): number;
		transform?(item: Item): Output;
	},
): Array<Item & { [P in Key]: { back?: Output; next?: Output } }> {
	const {
		breakpoint,
		key = 'flank',
		sort,
		transform = ({ slug, title }) => ({ slug, title }),
	} = options;

	sort && items.sort(sort);
	for (let idx = 0; idx < items.length; idx++) {
		const [back, next] = [items[idx - 1], items[idx + 1]];
		if (!back && !next) continue;

		items[idx][key] = items[idx][key] || ({} as Item[Key]);
		if (back) items[idx][key].back = transform(back);
		if (breakpoint && breakpoint(next)) return items;
		if (next) items[idx][key].next = transform(next);
	}

	return items;
}
