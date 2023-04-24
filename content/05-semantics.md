---
title: Semantics
---


### Front Matter

Metadata will be generated from the front matter semantically placed at the start of the file between two separate 3-dashes. Every property is expressed in one line as a `(key): (data)` pair — separated by a colon and whitespace — and every `data` is expressed as a string.

To create an array of values, wrap the `(data)` with brackets (`[ ... ]`) and separate the values with `,`, anything inside the brackets will be the values for the `(key)`. Values can only be a string and not another array or object.

To create nested properties, add the nested property separated by a colon (`:`), the syntax would be `(parent):(property): (data)`. You can add however many `:` you'd like, but once it becomes an object, it cannot be assigned a top-level value for that parent.

```yaml
---
title: My First Blog Post, Hello World!
description: Welcome to my first post.
tags: [blog, life, coding]
date:published: 2021-04-01
date:updated: 2021-04-13

# this will overwrite previous 'date:published' and 'date:updated'
# date: ... <- do not assign top-level data
---
```

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

Everything after front matter will be considered as content and will be parsed as markdown. You can use the `!{}` syntax to access the metadata from the front matter.

```yaml
---
tags: [blog, life, coding]
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

### Code Blocks

Code blocks are fenced with 3 backticks and can optionally be assigned a language for syntax highlighting. The language must be a valid [shiki supported language](https://github.com/shikijs/shiki/blob/main/docs/languages.md#all-languages) and is case-insensitive.

``````markdown
```language
// code
```
``````

Additional information can be added to the code block through data attributes, accessible via `data-[key]="[value]"`. The dataset can be specified from any line within the code block using `#$ key: value` syntax, and it will be omitted from the output. The key-value pair should roughly conform to the [`data-*` rules](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*), meaning `key` can only contain alphanumeric characters and hyphens, while `value` can be any string that fits in the data attribute value.

There are some special keys that will be used to modify the code block itself, and they are

- `#$ file: string` | add a filename to the code block that will be shown above the output
- `#$ line-start: number` | define the starting line number of the code block
