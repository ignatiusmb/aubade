---
rank: 6
title: /transform
description: transformation utilities for Aubade
---

the `/transform` module provides a `chain()` function to link items in a list with their previous and next neighbors.

```typescript
export function chain<
	Item extends Record<string, any>,
	Key extends string = 'flank',
	Output = { slug?: string; title?: any },
>(
	items: Item[],
	options: {
		key?: Key;
		sort?(x: Item, y: Item): number;
		breakpoint?(next: Item): boolean;
		transform?(item: Item): Output;
	},
): Array<Item & { [P in Key]: { back?: Output; next?: Output } }>;
```

- `key` — name the property that will be added, defaults to `flank`.
- `sort` — sort the items before chaining them, defaults to no sorting.
- `breakpoint` — stop the chain on a certain condition after sorting, defaults to no breakpoint.
- `transform` — transform the output before linking, defaults to only `{ slug, title }`.
