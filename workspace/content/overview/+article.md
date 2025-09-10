---
rank: 0
title: Overview
description: introduction to Aubade
---

Aubade is a minimal framework for authoring in markdown. it provides the primitives and utilities to treat markdown files (with front matter) as the source of truth, turning them into structured data you can query and HTML you can publish. Aubade offers a [recommended layout](#structure) for keeping prose and assets organized — the overall architecture remains yours to define.

## core

the entry point of Aubade is the `assemble()` function — it takes a markdown file with front matter and returns everything in one call. it is built on the **front matter parser** and **markdown compiler**, which are also available as [standalone modules](#batteries).

```javascript
import { assemble } from 'aubade';

const source = 'your markdown text';
const { doc, manifest, meta } = assemble(source);
```

| prop       | description                                                    |
| ---------- | -------------------------------------------------------------- |
| `doc`      | `{ tokens, html() }` from [`engrave()`](/docs/artisan#engrave) |
| `manifest` | parsed [front matter](/docs/manifest#frontmatter)              |
| `meta`     | raw `head` and `body` slices, plus generated metadata          |

for [structured collections](#structure) in a filesystem, use [`orchestrate()` from `/conductor`](/docs/conductor) — content orchestration built on top of `assemble()`.

## batteries

these are the primitives behind [`assemble()`](#core). they are platform-agnostic and work in any JavaScript environment:

- **[markdown compiler](/docs/artisan)** — tokenize markdown into `{ tokens, html() }`; call `.html()` for direct output.
- **[front matter parser](/docs/manifest)** — parse a minimal YAML subset into plain JavaScript objects and primitives.

Aubade also layers **platform-specific utilities** on these primitives, such as:

- **[content conductor](/docs/conductor)** — recursively load and assemble markdown files from a filesystem (`node:fs`).

## structure

Aubade follows the [principle](/docs/philosophy) of keeping prose separate from code and collocating articles with their assets. the recommended layout looks like this:

```
/posts
  /hello-world
    +article.md
    +appendix.md
    image.png
    video.mp4
  /writing-markdown
    +article.md
    +syntax.md
    graph.svg
```

- each directory is a slug,
- `+article.md` is the main entry point,
- additional `+*.md` files become sub-pages,
- assets stay alongside the articles.

this convention keeps each article self-contained and makes large collections more maintainable. Aubade recommends this layout, but never enforces it — the structure of your project is always your decision.
