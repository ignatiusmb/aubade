---
title: Module / FileSystem
---

Marqua provides a couple of functions coupled with the FileSystem module to `compile` or `traverse` a directory, given an entry point.

Using a folder structure shown below as a reference for the next examples, the usage will be as follows

```
content
    ├── posts
    │   ├── draft.my-amazing-two-part-series-part-1.md
    │   ├── draft.my-amazing-two-part-series-part-2.md
    │   ├── 2021-04-01.my-first-post.md
    │   └── 2021-04-13.marqua-is-the-best.md
    └── reviews
        ├── game
        │   └── doki-doki-literature-club.md
        ├── book
        │   ├── amazing-book-one.md
        │   └── manga-is-literature.md
        └── movie
            ├── spirited-away.md
            └── your-name.md
```

### compile

```typescript
interface HydrateChunk {
  breadcrumb: string[];
  buffer: Buffer;
  parse: typeof parse;
}

export function compile(
  entry: string,
  hydrate?: (chunk: HydrateChunk) => undefined | Output
): undefined | Output;
```

The first argument of `compile` is the source entry point.

### traverse

```typescript
export function traverse(
  options: {
    entry: string;
    compile?(path: string): boolean;
    depth?: number;
  },
  hydrate?: (chunk: HydrateChunk) => undefined | Output,
  transform?: (items: Output[]) => Transformed
): Transformed;
```

The first argument of `traverse` is its `typeof options` and the second argument is an optional `hydrate` callback function. The third argument is an optional `transform` callback function.

The `compile` property of the `options` object is an optional function that takes the full path of a file from the `entry` point and returns a boolean. If the function returns `true`, the file will be processed by the `compile` function, else it will be passed over to the `hydrate` function if it exists.

An example usage from the *hypothetical* content folder structure above should look like

```javascript
import { compile, traverse } from 'marqua/fs';

/* compile - parse a single source file */
const body = compile(
  'content/posts/2021-04-01.my-first-post.md',
  ({ breadcrumb: [filename], buffer, parse }) => {
    const [date, slug] = filename.split('.');
    const { content, metadata } = parse(buffer.toString('utf-8'));
    return { ...metadata, slug, date, content };
  }
); // {'posts/2021-04-01.my-first-post.md'}

/* traverse - scans a directory for sources */
const data = traverse(
  { entry: 'content/posts' },
  ({ breadcrumb: [filename], buffer, parse }) => {
    if (filename.startsWith('draft')) return;
    const [date, slug] = filename.split('.');
    const { content, metadata } = parse(buffer.toString('utf-8'));
    return { ...metadata, slug, date, content };
  }
); // [{'posts/3'}, {'posts/4'}]

/* traverse - nested directories infinite recursive traversal */
const data = traverse(
  { entry: 'content/reviews', depth: -1 },
  ({ breadcrumb: [slug, category], buffer, parse }) => {
    const { content, metadata } = parse(buffer.toString('utf-8'));
    return { ...metadata, slug, category, content };
  }
); // [{'game/0'}, {'book/0'}, {'book/1'}, {'movie/0'}, {'movie/1'}]
```
