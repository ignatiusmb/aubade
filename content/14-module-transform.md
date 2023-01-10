---
title: Module / Transform
---

<!-- markdownlint-disable MD051 -->
This module provides a set of transformer functions for the [`traverse.transform`](#traverse) parameter. These functions can be used in conjunction with each other, by utilizing the `pipe` function provided from the `'mauss'` package and re-exported by this module, you can do the following

```typescript
import { traverse } from 'marqua/fs';
import { pipe, ... } from 'marqua/transform';

traverse(
  { entry: 'content' },
  ({ ... }) => { ... },
  pipe(...)
);
```

### chain

The `chain` transformer is used to add a `flank` property to each items and attaches the previous (`idx - 1`) and the item after (`idx + 1`) as `flank: { back, next }`, be sure to sort it the way you intend it to be before running this transformer.

```typescript
interface ChainOptions<T> {
  base?: string;
  breakpoint?: (next: T) => boolean;
}

export function chain<T extends { slug: string; title: string }>(
  options: ChainOptions<T>
): (items: T[]) => Array<T & { flank?: { back?: T; next?: T } }>;
```

- A `base` string can be passed as a prefix in the `slug` property of each items.
- A `breakpoint` function can be passed to stop the chain on a certain condition.

    ```typescript
    traverse(
      { entry: 'content' },
      ({ ... }) => { ... },
      chain({
        breakpoint(item) {
          return ...
        }
      })
    );
    ```
