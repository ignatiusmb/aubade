---
title: Module / FileSystem
---

```typescript
interface HydrateChunk {
  frontMatter: FrontMatter;
  content: string;
  breadcrumb: string[];
}

export function compile(
  options: string,
  hydrate?: (chunk: HydrateChunk) => undefined | Output
): undefined | Output;

export function traverse(
  options: string,
  hydrate?: (chunk: HydrateChunk) => Output[]
): Output[];
```

Marqua provides a couple of functions coupled with the FileSystem module. Using a folder structure shown below as a reference for the next examples, the usage will be as follows

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
export function compile(source: string): undefined | Output;
```

The first argument of `compile` is the source `string`.

### traverse

```typescript
interface Options {
  entry: string;
  extensions?: string[];
  depth?: number;
}

export function traverse(options: Options, hydrate?: Hydrate): Output[];
```

The first argument of `traverse` is the `Options` and the second argument is an optional `hydrate` callback that can return an object with `content` and all properties of `frontMatter`.

An example usage from the *hypothetical* content folder structure above should look like

```javascript
import { compile, traverse } from 'marqua';

/* compile - parse a single source file */
const body = compile(
  'content/posts/2021-04-01.my-first-post.md',
  ({ frontMatter, content, breadcrumb: [filename] }) => {
    const [date, slug] = filename.split('.');
    return { slug, date, ...frontMatter, content };
  }
); // {'posts/2021-04-01.my-first-post.md'}

/* traverse - scans a directory for sources */
const data = traverse(
  'content/posts',
  ({ frontMatter, content, breadcrumb: [filename] }) => {
    if (filename.startsWith('draft')) return;
    const [date, slug] = filename.split('.');
    return { slug, date, ...frontMatter, content };
  }
); // [{'posts/3'}, {'posts/4'}]

/* traverse - nested directories recursive scan */
const data = traverse(
  { entry: 'content/reviews', depth: -1 },
  ({ frontMatter, content, breadcrumb: [slug, category] }) => {
    return { slug, category, date, ...frontMatter, content };
  }
); // [{'game/0'}, {'book/0'}, {'book/1'}, {'movie/0'}, {'movie/1'}]
```
