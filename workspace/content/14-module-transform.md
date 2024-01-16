---
title: Module / Transform
---


This module provides a set of transformer functions for the [`traverse({ transform: ... })`](/docs/module-fs#traverse) parameter. These functions can be used in conjunction with each other, by utilizing the `pipe` function provided from the `'mauss'` package and re-exported by this module, you can do the following

```typescript
import { traverse } from 'marqua/fs';
import { pipe } from 'marqua/transform';

traverse({ entry: 'path/to/content' }, () => {}, pipe(/* ... */));
```

## chain

The `chain` transformer is used to add a `flank` property to each items and attaches the previous (`idx - 1`) and the item after (`idx + 1`) as `flank: { back, next }`, be sure to sort it the way you intend it to be before running this transformer.

```typescript
export function chain<T extends { slug?: string; title?: any }>(options: {
	base?: string;
	breakpoint?: (next: T) => boolean;
	sort?: (x: T, y: T) => number;
}): (items: T[]) => Array<T & Attachment>;
```

-   A `base` string can be passed as a prefix in the `slug` property of each items.
-   A `breakpoint` function can be passed to stop the chain on a certain condition.

    ```typescript
    traverse(
    	{ entry: 'path/to/content' },
    	({}) => {},
    	chain({
    		breakpoint(item) {
    			return; // ...
    		},
    	}),
    );
    ```

-   A `sort` function can be passed to sort the items before chaining them.
