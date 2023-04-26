---
title: Module / Core
---


Marqua provides a lightweight core module with minimal features and dependencies that does not rely on platform-specific modules so that it could be used anywhere safely.

### parse

Where the parsing happens, it accepts a source string and returns a `{ content, metadata }` structure. This function is mainly used to separate the front matter from the content.

```typescript
export function parse(source: string): {
  content: string;
  metadata: FrontMatter & {
    readonly estimate: number;
    readonly table: MarquaTable[];
  };
}
```

<!-- markdownlint-disable MD051 -->
If you need to read from a file or folder, use the `compile` and `traverse` functions from the [FileSystem module](#module-fs).

### construct

Where the `metadata` or front matter index gets constructed, it is used in the `parse` function.

```typescript
type Primitives = null | boolean | string;
type ValueIndex = Primitives | Primitives[];
type FrontMatter = { [key: string]: ValueIndex | FrontMatter };

export function construct(raw: string): ValueIndex | FrontMatter;
```
