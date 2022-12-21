---
title: Module / FileSystem
---

Marqua provides a couple of functions coupled with the FileSystem module to `compile` or `traverse` a directory, given an entry point.

```typescript
interface HydrateChunk {
  breadcrumb: string[];
  content: string;
  frontMatter: FrontMatter;
}

export function compile(
  entry: string,
  hydrate?: (chunk: HydrateChunk) => undefined | Output
): undefined | Output;

interface TraverseOptions<Output extends object = {}> {
  entry: string;
  extensions?: string[];
  depth?: number;

  sort?(
    x: [keyof Output] extends [never] ? Record<string, any> : Output,
    y: [keyof Output] extends [never] ? Record<string, any> : Output
  ): number;
}

export function traverse(
  options: TraverseOptions,
  hydrate?: (chunk: HydrateChunk) => undefined | Output
): Output[];
```

Using a folder structure shown below as a reference for the next examples, the usage will be as follows

```
~ Hypothetical Content Folder Structure
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
  content: string;
  frontMatter: FrontMatter;
}

export function compile(
  entry: string,
  hydrate?: (chunk: HydrateChunk) => undefined | Output
): undefined | Output;
```

The first argument of `compile` is the source entry point.

### traverse

```typescript
interface TraverseOptions<Output extends object = {}> {
  entry: string;
  extensions?: string[];
  depth?: number;

  sort?(
    x: [keyof Output] extends [never] ? Record<string, any> : Output,
    y: [keyof Output] extends [never] ? Record<string, any> : Output
  ): number;
}

export function traverse(
  options: TraverseOptions,
  hydrate?: (chunk: HydrateChunk) => undefined | Output
): Output[];
```

The first argument of `traverse` is the `TraverseOptions` and the second argument is an optional `hydrate` callback that can return an object with `content` property and all properties of `frontMatter`.

An example usage from the *hypothetical* content folder structure above should look like

```javascript
import { compile, traverse } from 'marqua/fs';

/* compile - parse a single source file */
const body = compile(
  'content/posts/2021-04-01.my-first-post.md',
  ({ breadcrumb: [filename], content, frontMatter }) => {
    const [date, slug] = filename.split('.');
    return { slug, date, ...frontMatter, content };
  }
); // {'posts/2021-04-01.my-first-post.md'}

/* traverse - scans a directory for sources */
const data = traverse(
  { entry: 'content/posts'},
  ({ breadcrumb: [filename], content, frontMatter }) => {
    if (filename.startsWith('draft')) return;
    const [date, slug] = filename.split('.');
    return { slug, date, ...frontMatter, content };
  }
); // [{'posts/3'}, {'posts/4'}]

/* traverse - nested directories infinite recursive traversal */
const data = traverse(
  { entry: 'content/reviews', depth: -1 },
  ({ breadcrumb: [slug, category], content, frontMatter }) => {
    return { slug, category, ...frontMatter, content };
  }
); // [{'game/0'}, {'book/0'}, {'book/1'}, {'movie/0'}, {'movie/1'}]
```
