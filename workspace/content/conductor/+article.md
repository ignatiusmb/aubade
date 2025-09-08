---
rank: 3
title: /conductor
description: filesystem orchestration for Aubade
---

the `/conductor` module orchestrates content in the filesystem. it provides an `orchestrate()` function to traverse directories and build a structured tree of articles with their metadata.

> requires [`node:fs`](https://nodejs.org/api/fs.html) for filesystem access.

## orchestrate

```typescript
export async function orchestrate<Output extends Record<string, any>>(
	entry: string,
	inspect?: Inspect<Output>,
): Promise<Output[]>;
```

`orchestrate()` walks a directory tree, collecting and processing files. by default, only markdown files are included. use the optional `inspect` function to filter files and control how each one is transformed.

```typescript
const outputs = await orchestrate('content');
// is the same as:
const outputs = await orchestrate('content', ({ path }) => {
	if (!path.endsWith('.md')) return;
	return async ({ assemble, buffer }) => {
		const { manifest, md, meta } = assemble(buffer.toString('utf-8'));
		if (manifest.draft) return;
		return { ...manifest, ...meta, content: md.html() };
	};
});
```

the first argument is the entrypoint directory. it will be traversed recursively until the tree ends.

## Inspect

```typescript
type Falsy = false | null | undefined;

interface Inspect<Output extends Record<string, any>> {
	(options: Options): Falsy | ((chunk: Chunk) => Promise<Falsy | Output>);
}
```

the second argument to `orchestrate()` is an `inspect` function. it receives an [Options](#inspect-options) object and should either:

- return a falsy value to skip the file, or
- return a function to process the file with a [Chunk](#inspect-chunk).

this gives you full control over which files are included and how they're converted.

### Options

```typescript
interface Options {
	breadcrumb: string[]; // [filename, parent, ...ancestors]
	depth: number;
	parent: string;
	path: string;
}
```

| prop         | context                                             |
| ------------ | --------------------------------------------------- |
| `breadcrumb` | path segments leading to the file, in reverse order |
| `depth`      | depth in the directory tree, starting at `0`        |
| `parent`     | parent directory path, absolute from `entry`        |
| `path`       | full path of the file, absolute from `entry`        |

### Chunk

```typescript
interface Chunk {
	assemble: typeof assemble;
	buffer: Buffer;
	engrave: typeof engrave;
	siblings: Array<{ filename: string; buffer: Promise<Buffer> }>;
	task(fn: (tools: { fs: typeof fs }) => Promise<void>): void;
}
```

| prop       | context                                                                         |
| ---------- | ------------------------------------------------------------------------------- |
| `assemble` | the [`assemble()` function from core](/docs/overview#core)                      |
| `buffer`   | raw file content as a `Buffer`                                                  |
| `engrave`  | the [`engrave()` function from `/artisan`](/docs/artisan#engrave)               |
| `siblings` | sibling files in the same directory, with filenames and lazy buffers            |
| `task(fn)` | register async work to run in parallel (e.g. image conversion or asset copying) |
