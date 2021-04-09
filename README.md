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

***

<h3 align="center"><pre>Marqua ｜ <a href="LICENSE">MIT License</a></pre></h3>
