---
title: Module / Core
---


Marqua provides a lightweight core module with minimal features and dependencies that does not rely on platform-specific modules so that it could be used anywhere safely.

### parse

Where the parsing happens, it accepts a source string and returns a `{ content, metadata }` structure. This function is mainly used to separate the front matter from the content.

```typescript
export function parse(source: string): {
  content: string;
  metadata: Record<string, any> & {
    readonly estimate: number;
    readonly table: MarquaTable[];
  };
}
```

<!-- markdownlint-disable MD051 -->
If you need to read from a file or folder, use the `compile` and `traverse` functions from the [FileSystem module](#module-fs).

### Front Matter

Metadata will be generated from the front matter semantically placed at the start of the file between two separate 3-dashes. Marqua syntax resembles yaml in some ways except it only read raw strings. It doesn't support whitespace indentation, `[...]`, or `{...}`. Instead, it has some ways to handle creating objects/maps and arrays/lists.

```yaml
---
title: My First Blog Post, Hello World!
description: Welcome to my first post.
tags: blog, life, coding
date:published: 2021-04-01
date:updated: 2021-04-13
---
```

Every property is expressed in one line as a `[key]: [value]` pair, separated by a colon and whitespace. The whitespace after the key denotes the end of that key and indicates the start of the value.

To create nested properties, add the keys separated by a colon (`:`). Once it becomes an object, it cannot be assigned a top-level value or it will either break or overwrite the previously assigned properties.

The output of the front matter should be

```json
{
  "title": "My First Blog Post, Hello World!",
  "description": "Welcome to my first post.",
  "tags": ["blog", "life", "coding"],
  "date": {
    "published": "2021-04-01",
    "updated": "2021-04-03",
  },
}
```

### Content

Everything after front matter (the second 3-dashes) will be considered as content. All declared properties in the front matter are available to the content and can be accessed inside `!{name}`, replace `name` with your property key or keys separated by a colon.

```yaml
---
tags: blog, life, coding
date:published: 2021-04-01
date:updated: 2021-04-13
---

# the properties above will result to
#
# tags = ['blog', 'life', 'coding']
# date = {
#   published: '2021-04-01',
#   updated: '2021-04-13',
# }
#
# these can be accessed with !{}

# !{tags:0} - accessing tags array at index 0
This article's main topic will be about !{tags:0}

# !{date:property} - accessing property of date
This article was originally published on !{date:published}
Thoroughly updated through this website on !{date:updated}
```

Heading starts at 2 `##` (equivalent to `<h2>`) with the lowest one being 4 `####` (equivalent to `<h4>`) and should conform with the [rules of markdownlint](https://github.com/DavidAnson/markdownlint#rules--aliases), with some essential ones to follow are

- MD001: Heading levels should only increment by one level at a time
- MD003: Heading style; only ATX style
- MD018: No space after hash on atx style heading
- MD023: Headings must start at the beginning of the line
- MD024: Multiple headings with the same content; siblings only
- MD042: No empty links

If you're using VSCode, you can install the [markdownlint extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) to help you catch these lint errors / warnings and write better markdown. These rules can be configured, see the [.jsonc template](https://github.com/DavidAnson/markdownlint/blob/main/schema/.markdownlint.jsonc) and [.yaml template](https://github.com/DavidAnson/markdownlint/blob/main/schema/.markdownlint.yaml) with an [example here](https://github.com/ignatiusmb/mauss.dev/blob/master/.markdownlint.yaml).
