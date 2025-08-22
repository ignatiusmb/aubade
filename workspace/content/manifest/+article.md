---
rank: 2
title: /manifest
---

the `/manifest` module handles front matter in markdown files. it parses a minimal, YAML-like syntax into plain JavaScript objects and primitives, and can also stringify objects back into front matter. built from the ground up to be lightweight and efficient, use it together with the other modules or independently in any JavaScript environment.

## FrontMatter

front matter in Aubade is represented by a minimal recursive type. values can be strings, booleans, nulls, arrays, or nested objects:

```typescript
type Primitives = string | boolean | null;

export interface FrontMatter {
	[key: string]: Primitives | Primitives[] | FrontMatter | FrontMatter[];
}
```

## parse

convert a front matter string into a [FrontMatter](#frontmatter) object.

```typescript
export function parse(source: string): FrontMatter[string];
```

Aubade only parses — it does not validate. to enforce types, use any validation library of your choice, this example uses `define()` from [`mauss`](https://github.com/alkamauss/mauss):

```javascript
import { parse } from 'aubade/manifest';
import { define } from 'mauss';

const source = ''; // front matter source placeholder
const manifest = parse(source);

const schema = define(({ string }) => ({ title: string() }));
const metadata = schema(manifest); // throws if invalid
```

## stringify

turn a front matter object back into a YAML string:

```typescript
export function stringify(data: object): string;
```

example:

```javascript
import { writeFileSync } from 'node:fs';
import { stringify } from 'aubade/manifest';

const data = { title: 'hello world', date: '2030-01-01' };
const body = ''; // markdown body placeholder
writeFileSync('+article.md', `---\n${stringify(data)}\n---\n\n${body}\n`);
```
