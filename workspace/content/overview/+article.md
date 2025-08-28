---
rank: 0
title: Overview
description: introduction to Aubade
---

Aubade is a filesystem-first framework for authoring in markdown. it treats your markdown files (with front matter) as the source of truth, turning them into structured data you can query and HTML you can publish — letting you power a full site or application directly from plain text.

## batteries

Aubade ships with tools you can use together or independently in any JavaScript environment:

- **[markdown compiler](/docs/artisan#markdown)** — tokenize markdown into `{ tokens, html() }`; call `.html()` for direct output.
- **[front matter parser](/docs/manifest)** — parse a minimal YAML subset into plain JavaScript objects and primitives.

## core

`assemble()` is the main building block. it takes a markdown string and returns:

- `manifest` — parsed [front matter](/docs/manifest#frontmatter),
- `md` — `{ tokens, html() }`, and
- `meta` — `{ body, ... }` with generated metadata.

```javascript
import { assemble } from 'aubade';

const source = ''; // markdown source placeholder
const { manifest, md, meta } = assemble(source);
```

for collections, [`orchestrate()` from `/conductor`](/docs/conductor) walks your directories and applies the same batteries across the content tree.

## structure

Aubade's [principle](/docs/philosophy) is to keep content separate from code and collocate articles with their assets. a common layout:

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

- directories are slugs,
- `+article.md` is the main entry,
- extra `+*.md` files become sub-pages,
- assets stay alongside the articles.

this keeps each article self-contained and easier to manage. Aubade doesn't enforce this layout — the primitives adapt to any structure, and you can drop it into existing markdown projects without friction.
