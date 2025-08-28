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

the signature is quite complex, but that makes the function convenient to use. it takes a list of items that will be grouped, sorted, and linked. the `options` object allows you to customize each step of the process:

| option       | description                                                |
| ------------ | ---------------------------------------------------------- |
| `key`        | the property name which will contain the linked neighbors. |
| `group`      | determine the group an item belongs to.                    |
| `sorter`     | determine the sorting function for a group.                |
| `breakpoint` | determine if the chain should be stop at this item.        |
| `transform`  | transform an item into the output format for linking.      |
| `finalize`   | process the grouped items into the final output list.      |

the final output is the list of items with their neighbors linked in the specified `key` property. a minimal example:

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
