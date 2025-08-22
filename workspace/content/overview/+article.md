---
rank: 0
title: Overview
---

Aubade is a filesystem-first framework that turns your markdown and front matter into structured content.

## batteries

Aubade ships with tools designed from the ground up to be lightweight and efficient. you can use them together or independently, in any JavaScript environment. the main tools are:

* **[markdown compiler](/docs/artisan#markdown)** — tokenize markdown into `{ tokens, html() }`, call `.html()` for direct output.
* **[front matter parser](/docs/manifest)** — parse a minimal subset of YAML syntax into plain JavaScript objects and primitives.

## core

`assemble()` is the basic building block of Aubade. it takes the contents of a markdown file as a string and returns:

* `manifest` — parsed front matter,
* `md` — `{ tokens, html() }`, and
* `meta` — `{ body, ... }` including generated metadata.

```javascript
import { assemble } from 'aubade';

const source = ''; // markdown source placeholder
const { manifest, md, meta } = assemble(source);
```

for larger collections, `orchestrate()` recursively traverses your directories and adapts to your file structure, giving you access to all the same batteries across your content tree.

## structure

while you can design your own layout, [Aubade's vision](/docs/philosophy) is to keep content separate from code and collocate articles with their assets. a typical layout might look like:

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

* directories act as slugs for your articles,  
* `+article.md` serves as the main entry point,  
* additional `+*.md` files branch into sub-pages, and  
* assets like images or videos stay alongside the articles.  

this keeps each article and its assets self-contained, making both content management and collaboration simpler. nevertheless, *nothing in Aubade enforces it* — the primitives are flexible enough to adapt to any structure you prefer, and you can use it with your existing markdown files without any issues.
