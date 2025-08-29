---
rank: 6
title: /transform
description: transformation utilities for Aubade
---

the `/transform` module provides utilities for processing and linking lists of items. its primary function, `chain()`, lets you connect each item with its previous and next neighbors, while optionally grouping, sorting, and transforming them.

## chain

```typescript
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
): Finalized[];
```

`chain` takes a list of items and links them according to previous and next relationships. the `options` object allows you to control grouping, sorting, breaking points, transformations, and final processing.

| option       | description                                              |
| ------------ | -------------------------------------------------------- |
| `key`        | the property name that will contain the linked neighbors |
| `group`      | determine which group an item belongs to                 |
| `sorter`     | define the sorting function for a group                  |
| `breakpoint` | specify if the chain should stop at this item            |
| `transform`  | convert an item into the output format for linking       |
| `finalize`   | process grouped items into the final output list         |

the result is a list of items with their neighbors linked under the specified `key` property. a minimal example:

```typescript
import { orchestrate } from 'aubade/conductor';
import { chain } from 'aubade/transform';

async function posts() {
	const items = await orchestrate('content');
	return chain(items, {
		sorter() {
			return ({ rank: x }, { rank: y }) => Number(x) - Number(y);
		},
		transform: ({ slug, title }) => ({ slug: '/docs/' + slug, title }),
	});
}
```
