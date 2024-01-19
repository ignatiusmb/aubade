---
title: Modules
---

Aubade provides a set of modules that can be used in conjunction with each other.

## core

A lightweight core module with minimal features and dependencies that does not rely on platform-specific modules so that it could be used anywhere safely.

### parse

Parse accepts a source string and returns a `{ body, metadata }` structure. This function is mainly used to separate the front matter from the content or in this case `body`.

```typescript
export function parse(source: string): {
	body: string;
	metadata: Record<string, any> & {
		readonly estimate: number;
		readonly table: AubadeTable[];
	};
};
```

If you need to read from a file or folder, use the `visit` and `traverse` function from the [`/compass` module](/docs/modules#compass).

### construct

Where the `metadata` or front matter index gets constructed, it is used in the `parse` function.

```typescript
type Primitives = null | boolean | string;
type ValueIndex = Primitives | Primitives[];
type FrontMatter = { [key: string]: ValueIndex | FrontMatter };

export function construct(raw: string): ValueIndex | FrontMatter;
```

## /artisan

### transform

This isn't usually necessary, but in case you want to handle the markdown parsing and rendering by yourself, here's how you can tap into the `transform` function provided by the module.

```typescript
export interface Dataset {
	file?: string;
	language?: string;
	[data: string]: string | undefined;
}

export function transform(source: string, dataset: Dataset): string;
```

A simple example would be passing a raw source code as a string.

```javascript
import { transform } from 'aubade/artisan';

const source = `
interface User {
	id: number;
	name: string;
}

const user: User = {
	id: 0,
	name: 'User'
}
`;

transform(source, { lang: 'typescript' });
```

Another one would be to use as a highlighter function.

```javascript
import markdown from 'markdown-it';
import { transform } from 'aubade/artisan';

// passing as a 'markdown-it' options
const marker = markdown({
	highlight: (source, language) => transform(source, { language });
});
```

### marker

The artisan module also exposes the `marker` import that is a markdown-it object.

```javascript
import { marker } from 'aubade/artisan';
import plugin from 'markdown-it-plugin'; // some markdown-it plugin
marker.use(plugin); // add this before calling 'visit' or 'traverse'
```

Importing `marker` to extend with plugins is optional, it is usually used to enable you to write [LaTeX](https://www.latex-project.org/) in your markdown for example, which is useful for math typesetting and writing abstract symbols using TeX function. Here's a working example with a plugin that uses [KaTeX](https://katex.org/).

```javascript
import { marker } from 'aubade/artisan';
import { visit } from 'aubade/compass';
import TexMath from 'markdown-it-texmath';
import KaTeX from 'katex';

marker.use(TexMath, {
	engine: KaTeX,
	delimiters: 'dollars',
});

const data = visit(/* source path */);
```

## /browser

### hydrate

This is the browser module to hydrate and give interactivity to your HTML.

```typescript
import type { ActionReturn } from 'svelte/action';

export function hydrate(node: HTMLElement, key: any): ActionReturn;
```

The `hydrate` function can be used to make the rendered code blocks from your markdown interactive, some of which are

-   toggle code line numbers
-   copy block to clipboard

Usage using [SvelteKit](https://kit.svelte.dev/) would simply be

```svelte
<script>
	import { hydrate } from 'aubade/browser';
	import { navigating } from '$app/stores';
</script>

<main use:hydrate={$navigating}>
	<!-- content here -->
</main>
```

Passing in the `navigating` store into the `key` parameter is used to trigger the update inside `hydrate` function and re-hydrate the DOM when the page changes but is not remounted.

## /compass

### visit

```typescript
interface AubadeTable {
	id: string;
	level: number;
	title: string;
}

export function visit<Output>(entry: string): Output & {
	readonly estimate: number;
	readonly table: AubadeTable[];
	content: string;
};
```

The first argument of `visit` is the source entry point.

### traverse

```typescript
export function traverse(
	entry: string,
	options: {
		depth?: number;
		files?(path: string): boolean;
	},
): {
	hydrate(
		load: (chunk: HydrateChunk) => undefined | Output,
		transform?: (items: Output[]) => Transformed,
	): Transformed;
};
```

The first argument of `traverse` is the directory entrypoint, and the second argument is its `options`. It returns an object with the `hydrate` method that accepts a `load` callback and an optional `transform` callback function.

The `files` property in `options` is an optional function that takes the full path of a file and returns a boolean. If the function returns `true`, the `load` callback will be called upon the file, else it will ignored and filtered out from the final output.

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
import { visit, traverse } from 'aubade/compass';

/* visit - parse a single source file */
const article = visit('content/posts/draft.my-amazing-two-part-series-part-1/index.md');
// ^- { content: '...', metadata: { ... } }

/* traverse - scans a directory for sources */
const data = traverse('content/posts', { depth: -1 }).hydrate(
	({ breadcrumb: [file, slug], buffer, marker, parse }) => {
		if (file.startsWith('draft')) return;
		const { body, metadata } = parse(buffer.toString('utf-8'));
		return { ...metadata, slug, content: marker.render(body) };
	},
);

/* traverse - nested directories infinite recursive traversal */
const data = traverse('content/reviews', { depth: -1 }).hydrate(
	({ breadcrumb: [file, slug, category], buffer, parse }) => {
		const { body, metadata } = parse(buffer.toString('utf-8'));
		return { ...metadata, slug, category, content: marker.render(body) };
	},
);
```

## /transform

This module provides a set of transformer function for the [`traverse(...).hydrate(..., /* transform */)` parameter](/docs/modules#compass-traverse). These function can be used in conjunction with each other, by utilizing the `pipe` function provided from the `'mauss'` package and re-exported by this module, you can do the following

```typescript
import { traverse } from 'aubade/compass';
import { pipe } from 'aubade/transform';

traverse('path/to/content').hydrate(() => {}, pipe(/* ... */));
```

### chain

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
    traverse('path/to/content').hydrate(
    	({}) => {},
    	chain({
    		breakpoint(item) {
    			return; // ...
    		},
    	}),
    );
    ```

-   A `sort` function can be passed to sort the items before chaining them.
