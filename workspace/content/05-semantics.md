---
title: Semantics
---

## Front Matter

Marqua supports a minimal subset of [YAML](https://yaml.org/) syntax for the front matter, which is semantically placed at the start of the file between two `---` lines, and it will be parsed as a JSON object.

All values will be attempted to be parsed into the supported types, which are `null`, `true`, and `false`. Any other values will go through the following checks and the first one to pass will be used.

-   Comments, `#`; indicated by a hash followed by the value, will be omitted from the output
-   Literal Block, `|`; indicated by a pipe followed by a newline and the value, will be parsed as multi-line string
-   Inline Array, `[x, y, 2]`; indicated by comma-separated values surrounded by square brackets, can only be primitives
-   Sequence, `- x`; indicated by a dash followed by a space and the value, this can contain nested maps and sequences

To have a line be parsed as-is, simply wrap the value with single or double quotes.

```yaml
---
title: My First Blog Post, Hello World!
description: Welcome to my first post.
tags: [blog, life, coding]
date:published: 2021-04-01
date:updated: 2021-04-13

# do not assign top-level data when using compressed nested properties syntax
# because this will overwrite previous 'date:published' and 'date:updated'
# date: ...
---
```

The above front matter will output the following JSON object...

```json
{
	"title": "My First Blog Post, Hello World!",
	"description": "Welcome to my first post.",
	"tags": ["blog", "life", "coding"],
	"date": {
		"published": "2021-04-01",
		"updated": "2021-04-03"
	}
}
```

Where we usually use indentation to represent the start of a nested maps, we can additionally denote them using a compressed syntax by combining the properties into one key separated by a colon without space, such as `key:x: value`. This should only be declared at the top-level and not inside nested maps.

## Body

Everything after front matter will be considered as the body and will be parsed as markdown. You can use the `!{}` syntax to access the metadata from the front matter.

```yaml
---
title: "My Amazing Series: Second Coming"
tags: [blog, life, coding]
date:
  published: 2021-04-01
  updated: 2021-04-13
---

# the properties above will result to
#
# title = 'My Amazing Series: Second Coming'
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

There should only be one `<h1>` heading per page, and it's usually declared in the front matter as `title`, which is why headings in the body starts at 2 `##` (equivalent to `<h2>`) with the lowest one being 4 `####` (equivalent to `<h4>`) and should conform with the [rules of markdownlint](https://github.com/DavidAnson/markdownlint#rules--aliases), with some essential ones to follow are

-   MD001: Heading levels should only increment by one level at a time
-   MD003: Heading style; only ATX style
-   MD018: No space after hash on atx style heading
-   MD023: Headings must start at the beginning of the line
-   MD024: Multiple headings with the same content; siblings only
-   MD042: No empty links

Generated ids can be specified from the text by wrapping them in `$(...)` as the delimiter. The text inside will be converted to kebab-case and will be used as the id. If no delimiter is detected, the whole text will be used.

If you're using VSCode, you can install the [markdownlint extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) to help you catch these lint errors / warnings and write better markdown. These rules can be configured, see the [.jsonc template](https://github.com/DavidAnson/markdownlint/blob/main/schema/.markdownlint.jsonc) and [.yaml template](https://github.com/DavidAnson/markdownlint/blob/main/schema/.markdownlint.yaml) with an [example here](https://github.com/ignatiusmb/mauss.dev/blob/master/.markdownlint.yaml).

### Code Blocks

Code blocks are fenced with 3 backticks and can optionally be assigned a language for syntax highlighting. The language must be a valid [shikiji supported language](https://github.com/antfu/shikiji/blob/main/docs/languages.md) and is case-insensitive.

````markdown
```language
// code
```
````

Additional information can be added to the code block through data attributes, accessible via `data-[key]="[value]"`. The dataset can be specified from any line within the code block using `#$ key: value` syntax, and it will be omitted from the output. The key-value pair should roughly conform to the [`data-*` rules](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*), meaning `key` can only contain alphanumeric characters and hyphens, while `value` can be any string that fits in the data attribute value.

There are some special keys that will be used to modify the code block itself, and they are

-   `#$ file: string` | add a filename to the code block that will be shown above the output
-   `#$ line-start: number` | define the starting line number of the code block
