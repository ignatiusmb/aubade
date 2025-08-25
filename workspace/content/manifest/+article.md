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

Aubade supports a minimal subset of [YAML](https://yaml.org/) syntax. front matter is placed at the top of a file between two `---` lines. [`assemble()`](/docs/overview#core) will automatically separate and parse it.

### supported types

- `null`, `true`, `false`
- strings
- arrays
- nested objects (maps and sequences)

### parsing rules

- **comments** (`# ...`) — ignored
- **literal blocks** (`|`) — multi-line strings
- **inline arrays** (`[x, y, z]`) — primitives only
- **sequences** (`- x`) — can contain nested maps or sequences
- **compressed nested properties** (`key:x: value`) — top-level only

wrap values in quotes to preserve literal content.

```yaml
date: '2025-08-22T11:04:00'
title: My First Blog Post
tags: [blog, coding]
image:
    source: url
    path: cdn_link
```

produces:

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

convert a front matter string into a [FrontMatter](#frontmatter) object. strip the wrapping `---` before calling `parse()`.

```typescript
export function parse(source: string): FrontMatter[string];
```

Aubade only parses — it does not validate. to enforce types, use any validation library of your choice. this example uses `define()` from [`mauss`](https://github.com/alkamauss/mauss):

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

turn a front matter object back into a YAML string:

```typescript
export function stringify(data: object): string;
```

example:

```javascript
import { writeFileSync } from 'node:fs';
import { stringify } from 'aubade/manifest';

const data = { date: '2030-01-01', title: 'hello world' };
const body = ''; // markdown body placeholder
writeFileSync('+article.md', `---\n${stringify(data)}\n---\n\n${body}\n`);
```
