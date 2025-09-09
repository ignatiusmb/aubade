---
rank: 10
title: Libretto
description: markdown dialect for Aubade
---

> **Status:** This specification is a work in progress. Syntax and behavior are subject to change as the compiler evolves.

Libretto is a selective Markdown dialect defined for Aubade. It is based on [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/) but only implements the constructs required to support Aubade's principles.

> Libretto [passes the CommonMark test suite](https://github.com/ignatiusmb/aubade/blob/master/workspace/aubade/src/artisan/markdown/example.spec.ts) for the subset of rules it adopts. Certain tests are skipped, and some behaviors are redefined.

The objective is not broad compatibility but a restricted, consistent syntax that remains human-readable, convenient to author, and produces predictable HTML.

## Deviations from CommonMark

### ATX headings

Closing hashes are not recognized. Any trailing `#` characters are rendered literally.

### Setext headings

Setext headings are not recognized. Only ATX headings are valid.

### Indented code blocks

Indented code blocks are not recognized. Only fenced code blocks are valid. Indentation outside lists and fenced blocks is stripped.

### Block quotes

Each line of a block quote must begin (optionally preceded by spaces) with `>`. A line without `>` terminates the block quote.

### Bare links

Plain URLs are not autolinked. They must be enclosed in `<...>` or `[text](url)`.

## Extensions

### Heading attributes

Headings include a required `id` attribute (a URL-friendly slug of the heading text) and a `data-text` attribute containing the unmodified text.

### Code block info string

The first word after the opening code fence is treated as a language identifier. In the HTML output, the identifier is set as a `data-language` attribute on the `<pre>` element.

### Leaf images

Standalone images are rendered as block-level `<figure>` elements. If the image includes a title, it is rendered as a `<figcaption>`.

### Directives

Inline directives use the syntax `@<type>{<key>=<value> ...}`.

### Containers

Block containers use the syntax `::: type`.
