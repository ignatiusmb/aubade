---
title: Introduction
---

Marqua is an enhanced markdown compiler with code syntax highlighting that parses and converts your markdown code, files, and/or directories into a pseudo-AST, highly extensible and configurable. Marqua takes your code/contents with minimal boilerplate and generate structured markups, flexible enough for almost any related use cases.

Ever wanted to write a blog but didn't know where to start? Want to keep the contents in a markdown format but still be extendible? With Marqua, everything just works, *&#42;&#42;it just works&#42;&#42;*. Write a markdown file and it will automatically

<!-- markdownlint-disable MD051 -->
- parse the (custom) [front matter](#front-matter)
- add `id` to the headings
- generate a table of contents
- generate read time duration

The generated output format are highly adaptable to be used with any framework and designs of your choice. Iterate thoroughly and gain full control over your contents in your components and markup templates.

Markdown compiler is powered by [markdown-it](https://github.com/markdown-it/markdown-it) and code syntax highlighter is powered by [Shiki](https://github.com/shikijs/shiki).

### Quick Start

```
pnpm install marqua
```

Use the functions from the main module to `compile` a file or `traverse` directories.

```javascript
import { compile, traverse } from 'marqua';

compile(/* string | file options */, /* optional hydrate callback */);
traverse(/* string | dir options */, /* optional hydrate callback */);
```

Add interactivity to the code blocks with `hydrate` from `/browser` module.

```svelte
<script>
  import { hydrate } from 'marqua/browser';
</script>

<main use:hydrate>
  <!-- content here -->
</main>
```
