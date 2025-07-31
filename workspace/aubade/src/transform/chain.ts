export function chain<
	Item extends Record<string, any>,
	Key extends string = 'flank',
	Group extends string = 'default',
	Output = { slug?: string; title?: any },
	Processed = Item & { [P in Key]: { back?: Output; next?: Output } },
	Finalized = Processed,
>(
	items: Item[],
	options: {
		key?: Key;
		group?(item: Item): Group;
		sorter?(group: Group): (x: Item, y: Item) => number;
		breakpoint?(next: Item): boolean;
		transform?(item: Item): Output;
		finalize?(groups: Record<string, Processed[]>): Finalized[];
	},
): Finalized[] {
	const {
		key = 'flank',
		group = () => 'default',
		sorter,
		breakpoint,
		transform = ({ slug, title }) => ({ slug, title }),
		finalize = (groups) => Object.values(groups).flat(),
	} = options;

	const groups: Record<string, Item[]> = {};
	for (const item of items) {
		const key = group(item);
		if (key == null) continue;
		groups[key] = groups[key] || [];
		groups[key].push(item);
	}
	for (const name in groups) {
		sorter && groups[name].sort(sorter(name as Group));
		groups[name] = process(groups[name]);
	}
	return finalize(groups as any) as Finalized[];

	function process(array: Item[]) {
		for (let idx = 0; idx < array.length; idx++) {
			const [back, next] = [array[idx - 1], array[idx + 1]];
			if (!back && !next) continue;

			array[idx][key] = array[idx][key] || ({} as Item[Key]);
			if (back) array[idx][key].back = transform(back);
			if (breakpoint && breakpoint(next)) return array;
			if (next) array[idx][key].next = transform(next);
		}
		return array;
	}
}
