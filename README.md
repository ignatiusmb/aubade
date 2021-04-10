# Marqua ![Total npm downloads](https://img.shields.io/npm/dt/marqua) &middot; ![Published npm version](https://img.shields.io/npm/v/marqua) ![Monthly npm downloads](https://img.shields.io/npm/dm/marqua) ![License](https://img.shields.io/github/license/ignatiusmb/marqua)

> Augmented Markdown Compiler

An enhanced markdown compiler that parses and converts your markdown code, files, and/or directories into a pseudo-AST, highly extensible and configurable. Marqua takes your code/contents with minimal boilerplate and generate structured markups, flexible enough for almost any related use cases.

Ever wanted to write a blog but didn't know where to start? Want to keep the contents in a markdown format but still be extendible? With Marqua, everything just works, *it just works*. Write a markdown file and it will automatically

- parse the (custom) [front matter](#front-matter)
- add `id` to the headings
- generate a table of contents
- generate read time duration

The generated output format are highly adaptable to be used with any framework and designs of your choice. Iterate thoroughly and gain full control over your contents in your components and markup templates.

## Installation

```bash
npm install marqua
```

```js
import { compile, traverse } from 'marqua';

compile(/* string | file options */, /* optional hydrate callback */);
traverse(/* string | dir options */, /* optional hydrate callback */);
```

***

<h2 align="center"><pre>API Documentation</pre></h2>

### Imports

Marqua exposes 3 imports, 2 for the actual parsing, and 1 which is the markdown renderer which uses [markdown-it](https://github.com/markdown-it/markdown-it). As a result, its features can be extended via plugins that's made as a `markdown-it-plugin`.

```js
import { compile, traverse } from 'marqua';

/* compile - parse a single source file */
const body = compile(
  'content/posts/2021-04-01.my-first-post.md',
  ({ frontMatter, content, filename }) => {
    const [date, slug] = filename.split('.');
    return { slug, date, ...frontMatter, content };
  }
)

/* traverse - scans a directory for sources */
const data = traverse(
  'content/posts',
  ({ frontMatter, content, filename }) => {
    if (filename.startsWith('draft')) return;
    const [date, slug] = filename.split('.');
    return { slug, date, ...frontMatter, content };
  }
);
```

Marqua is shipped with built-in types, so any code editor that supports it should give autocompletion for the arguments passed. For a more detailed information, take a look at the [source code](src/index.ts) itself or at the [types](src/internal/types.ts) directly.

The first argument of `compile` can either be `string | FileOptions`, and for `traverse` it can be `string | (DirOptions & FileOptions)`. The second argument of both functions is an optional callback (`hydrate`), when `undefined` will by default, return an object with `content` and all properties of `frontMatter`.

```ts
interface FileOptions {
  pathname: string;

  /**
   * minimal = false
   *
   * it can be set to true so it will not generate anything
   * other than what is written in the file's frontMatter
   */
  minimal?: boolean;

  /**
   * exclude = []
   * accepts: 'toc' | 'rt' | 'date' | 'cnt'
   *
   * sometimes table of contents isn't needed and will add
   * a lot of unnecessary bytes while it's still useful to
   * know the read time duration
   *
   * these generated features can be individually turned off
   * by passing their 'id's in an array
   */
  exclude?: Array<string>;
}

interface DirOptions {
  dirname: string;

  /**
   * extensions = ['.md']
   *
   * traverse will only scan directories with files that
   * ends with '.md', this can be changed or added by
   * passing in other extensions
   *
   * it will consequently overwrite the default array and
   * remove '.md' extension, you will need to explicitly
   * readd it to your newly passed array
   */
  extensions?: Array<string>;
}
```

When everything is set to default (none of the optional properties are passed), passing in a string as the first argument of `compile` or `traverse` will be the same as only passing in `pathname` or `dirname` as the options.

```js
/* marker (optional): extendible markdown renderer */
import { marker } from 'marqua';
import plugin from 'markdown-it-plugin';
marker.use(plugin); // add this before calling 'compile' or 'traverse'
```

Extending `marker` with plugins is optional, it's already equipped with all the basics and a minimal footprint. But, let's say you wanted to write [LaTeX](https://www.latex-project.org/) in your markdown, which is useful for math typesetting and writing abstract symbols using TeX functions. Well, you can simply use a plugin to do exactly that. Here's a working example with a plugin that uses [KaTeX](https://katex.org/).

```js
import { marker, compile } from 'marqua';
import Math from 'markdown-it-texmath';
import KaTeX from 'katex';

marker.use(Math, {
  engine: KaTeX,
  delimiters: 'dollars',
});

const data = compile(/* source path */);
```

### Front Matter

Metadata will be generated from the front matter semantically placed at the start of the file between two separate 3-dashes. Marqua syntax resembles yaml in some ways except it only read raw strings. It doesn't support whitespace indentation, `[...]`, or `{...}`. Instead, it has some ways to handle creating objects/maps and arrays/lists.

```yml
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

To create an array/list, separate the values by a comma (`,`). This can be combined with nested properties. Applies to all keys with the exception of `title` and `description`, which always parses into raw strings.

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

Headings starts at 2 (`##`) with the lowest one being 4 (`####`) and should conform with the [rules of markdownlint](https://github.com/DavidAnson/markdownlint#rules--aliases), with some essential ones to follow are

- MD001: Heading levels should only increment by one level at a time
- MD003: Heading style -> only ATX style
- MD018: No space after hash on atx style heading
- MD023: Headings must start at the beginning of the line
- MD024: Multiple headings with the same content -> siblings only
- MD042: No empty links

If you're using VSCode, you can install the [markdownlint extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) to help you catch these lint errors / warnings and write better markdown. These rules can be configured, see the [.jsonc template](https://github.com/DavidAnson/markdownlint/blob/main/schema/.markdownlint.jsonc) and [.yaml template](https://github.com/DavidAnson/markdownlint/blob/main/schema/.markdownlint.yaml) with an [example here](https://github.com/ignatiusmb/mauss.dev/blob/master/.markdownlint.yml).

***

<h3 align="center"><pre>Marqua ｜ <a href="LICENSE">MIT License</a></pre></h3>
