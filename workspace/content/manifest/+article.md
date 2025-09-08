---
rank: 2
title: /manifest
description: front matter utilities for Aubade
---

the `/manifest` module provides Aubade's front matter utilities. it parses a minimal, YAML-like syntax into plain JavaScript objects and primitives, and can also stringify objects back into front matter. the module is lightweight, designed to work on its own or alongside other Aubade components in any JavaScript environment.

## FrontMatter

front matter in Aubade is expressed with a minimal recursive type. values can be strings, booleans, nulls, arrays, or nested objects:

```typescript
type Primitives = string | boolean | null;

export interface FrontMatter {
	[key: string]: Primitives | Primitives[] | FrontMatter | FrontMatter[];
}
```

Aubade supports a minimal subset of [YAML](https://yaml.org/) syntax. front matter appears at the top of a file between two `---` lines. [`assemble()`](/docs/overview#core) will automatically split and parse it.

| syntax          | category         | description                       |
| --------------- | ---------------- | --------------------------------- |
| `key: value`    | **map (object)** | fundamental key–value pair        |
| `text`/`"text"` | string           | plain or quoted text              |
| `null`          | null             | null literal                      |
| `true`/`false`  | boolean          | boolean literals                  |
| `[x, y, z]`     | array (inline)   | primitives only                   |
| `- x`           | sequence (block) | can contain nested maps/sequences |
| `\|`            | literal block    | multi-line string                 |
| `# comment`     | comment          | ignored during parsing            |

```yaml
date: '2025-08-22T11:04:00'
title: My First Blog Post
tags: [blog, coding]
image:
    source: url
    path: cdn_link
```

parsed and stringified to JSON, this becomes:

```json
{
	"date": "2025-08-22T11:04:00",
	"title": "My First Blog Post",
	"tags": ["blog", "coding"],
	"image": {
		"source": "url",
		"path": "cdn_link"
	}
}
```

## parse

```typescript
export function parse(source: string): FrontMatter[string];
```

`parse()` converts a front matter block into a [FrontMatter](#frontmatter) object. strip the wrapping `---` before calling it.

Aubade only parses — it does not validate. to enforce types, use a validation library of your choice. this example uses `define()` from [mauss](https://github.com/alkamauss/mauss):

```javascript
import { parse } from 'aubade/manifest';
import { define } from 'mauss';

const source = `
date: "2025-08-22T11:04:00"
title: My First Blog Post
tags: [blog, coding]
image:
  source: url
  path: cdn_link
`;
const manifest = parse(source);

// --- validate with define ---
const schema = define(({ array, string }) => ({
	date: string(),
	title: string(),
	tags: array(string()),
	image: {
		source: string(),
		path: string(),
	},
}));
const metadata = schema(manifest); // throws if invalid
```

## stringify

```typescript
export function stringify(data: object): string;
```

`stringify()` turns a front matter object back into YAML. use it when generating new markdown files or rewriting metadata.

```javascript
import { writeFileSync } from 'node:fs';
import { stringify } from 'aubade/manifest';

const data = { date: '2030-01-01', title: 'hello world' };
const body = ''; // markdown body placeholder
writeFileSync('+article.md', `---\n${stringify(data)}\n---\n\n${body}\n`);
```
