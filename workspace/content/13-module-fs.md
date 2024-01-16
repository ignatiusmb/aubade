---
title: Module / FileSystem
---

Marqua provides a couple of functions coupled with the FileSystem module to `compile` or `traverse` a directory, given an entry point.

## compile

```typescript
interface MarquaTable {
	id: string;
	level: number;
	title: string;
}

export function compile<Output>(entry: string): Output & {
	readonly estimate: number;
	readonly table: MarquaTable[];
	content: string;
};
```

The first argument of `compile` is the source entry point.

## traverse

```typescript
export function traverse(
	options: {
		entry: string;
		depth?: number;
		files?(path: string): boolean;
	},
	hydrate: (chunk: HydrateChunk) => undefined | Output,
	transform?: (items: Output[]) => Transformed,
): Transformed;
```

The first argument of `traverse` is its `typeof options`, the second argument is the `hydrate` callback function, and the third argument is an optional `transform` callback function.

The `files` property in `options` is an optional function that takes the full path of a file and returns a boolean. If the function returns `true`, the `hydrate` function will be called upon the file, else it will ignored and filtered out from the final output.

```
content
    ├── posts
    │   ├── draft.my-amazing-two-part-series-part-1
    │   │   └── index.md
    │   ├── draft.my-amazing-two-part-series-part-2
    │   │   └── index.md
    │   ├── my-first-post
    │   │   ├── index.md
    │   │   └── thumbnail.jpeg
    │   └── my-amazing-journey
    │       ├── index.md
    │       ├── photo.jpeg
    │       └── thumbnail.jpeg
    └── reviews
        ├── game
        │   └── doki-doki-literature-club
        │       ├── index.md
        │       └── thumbnail.jpeg
        ├── book
        │   ├── amazing-book-one
        │   │   ├── index.md
        │   │   └── thumbnail.jpeg
        │   └── manga-is-literature
        │       ├── index.md
        │       └── thumbnail.jpeg
        └── movie
            ├── spirited-away
            │   ├── index.md
            │   └── thumbnail.jpeg
            └── your-name
                ├── index.md
                └── thumbnail.jpeg
```

An example usage from a _hypothetical_ content folder structure above should look like

```javascript
import { compile, traverse } from 'marqua/fs';

/* compile - parse a single source file */
const article = compile('content/posts/draft.my-amazing-two-part-series-part-1/index.md'); 
	// ^- { content: '...', metadata: { ... } }

/* traverse - scans a directory for sources */
const data = traverse(
	{ entry: 'content/posts', depth: -1 },
	({ breadcrumb: [file, slug], buffer, marker, parse }) => {
		if (file.startsWith('draft')) return;
		const { body, metadata } = parse(buffer.toString('utf-8'));
		return { ...metadata, slug, content: marker.render(body) };
	},
);

/* traverse - nested directories infinite recursive traversal */
const data = traverse(
	{ entry: 'content/reviews', depth: -1 },
	({ breadcrumb: [file, slug, category], buffer, parse }) => {
		const { body, metadata } = parse(buffer.toString('utf-8'));
		return { ...metadata, slug, category, content: marker.render(body) };
	},
);
```
