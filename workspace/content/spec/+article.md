---
rank: 10
title: AubadeMark
---

> **here be dragons** — this spec is a work-in-progress. expect quirks and breaking changes as the compiler evolves.

## introduction

AubadeMark is a *deliberately selective* Markdown dialect built for Aubade's content system. it maintains partial parity with [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/), though not all features are supported.

the focus is to make markdown source as human-readable as possible while keeping it convenient to write. some features are intentionally omitted, and others are adapted to fit Aubade's content model.

## deviations

* **thematic breaks** — must be exactly `---`, `***`, or `___`.
* **no indented code blocks** — only fenced code blocks are allowed.
* **no ATX closing hashes** — only opening hashes are required.
* **no setext headings** — only ATX headings are supported.
* **no implicit blockquotes** — blockquotes must start with `>`.
* **no bare links** — URLs must be wrapped in `<...>` or used with `[text](url)`.
* **no raw HTML** — disabled to prevent injection.

## extensions

* **heading attributes** — headings include `id` and `data-text`.
* **unique heading ids** — automatically generated to prevent collisions.
* **wrapped codeblock lines** — each line wrapped in `<code>` tags.
* **data-language** — code blocks include a `data-language` attribute for syntax highlighting.
