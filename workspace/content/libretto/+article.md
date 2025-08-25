---
rank: 10
title: Libretto
description: markdown dialect for Aubade
---

> **here be dragons** — this spec is a work-in-progress. syntax and behavior may change as the compiler evolves.

Libretto is a _deliberately selective_ markdown dialect designed for Aubade. it draws from [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/), but only implements the parts that serve Aubade's principles.

> Libretto [passes the CommonMark test suite](https://github.com/ignatiusmb/aubade/blob/master/workspace/aubade/src/artisan/markdown/example.spec.ts), but only for the subset of rules it adopts. some tests are skipped, and certain behaviors are redefined to fit Libretto's design.

the goal is clarity and predictability, not broad compatibility: markdown should remain human-readable and convenient to write.

## deviations

### exact thematic breaks

only `---`, `***`, or `___` are recognized. variations such as `- - -` or `* * *` are treated as plain text.

### no ATX closing hashes

closing hashes in headings are not allowed; they are rendered as literal characters.

### no setext headings

only ATX-style headings are supported.

### no indented code blocks

indented code blocks are not recognized. only fenced blocks are valid. indentation is trimmed unless it belongs to a list or appears inside a code block.

### no lazy continuations

block quotes require `>` on every line. paragraphs cannot continue without it.

### no bare links

URLs are not autolinked. use `<...>` or `[text](url)`.

## extensions

### heading attributes

headings include a unique `id` (URL-friendly slug) and a `data-text` attribute containing the raw text.

### code block attributes

fenced code blocks carry a `data-language` attribute on the `<pre>` tag. additional attributes after the language are stored in the token's `meta`.

### code block line wrapping

each line inside a fenced code block is wrapped in its own `<code>` tag.

### leaf images

> to be implemented

standalone images are treated as block-level elements and wrapped in `<figure>`. if a title is present, it becomes a `<figcaption>`.

### custom directives

> todo: [github#183](https://github.com/ignatiusmb/aubade/pull/183)

inline directives can be defined with the `@{...}` syntax.

### custom containers

> to be implemented

block containers can be defined with `::: type`.
