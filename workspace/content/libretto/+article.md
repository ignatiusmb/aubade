---
rank: 10
title: Libretto
description: Markdown dialect for Aubade
---

> **Status:** This specification is a work in progress. Syntax and behavior are subject to change as the compiler evolves.

Libretto is a selective Markdown dialect defined for Aubade. It is based on [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/) but only implements the constructs required to support Aubade's principles.

> Libretto [passes the CommonMark test suite](https://github.com/ignatiusmb/aubade/blob/master/workspace/aubade/src/artisan/markdown/example.spec.ts) for the subset of rules it adopts. Certain tests are skipped, and some behaviors are redefined.

The objective is not broad compatibility but a restricted, consistent syntax that remains human-readable, convenient to author, and produces predictable HTML.

## Deviations

Libretto does not implement the full CommonMark feature set. Certain constructs are omitted or simplified.

- **Headings** \
  Only ATX headings are recognized. Closing `#` markers are not required, and any trailing hashes are rendered literally. Setext headings are not supported.

- **Code blocks** \
  Only fenced code blocks are recognized. Indented code blocks are not supported. Indentation outside lists and fenced blocks is stripped.

- **Block quotes** \
  Each line must begin with `>` (optionally preceded by spaces). A line without `>` terminates the block.

## Extensions

Libretto introduces additional behavior beyond CommonMark.

- **Heading attributes** \
  Each heading includes a unique `id` (a URL-friendly slug of the text) and `data-text` attribute containing the raw heading text.

- **Code block info string** \
  The first word after the opening fence is interpreted as a language identifier. In HTML, it is set as `data-language` on the `<pre>` element.

- **Tables** \
  Tables require leading and trailing pipes on each row. A delimiter row of dashes with optional colons is mandatory. The row above the delimiter, if present, is treated as the header. If no header is given, at least one body row must follow. Whitespace around cell contents is trimmed.

- **Leaf images** \
  Standalone images are rendered as block-level `<figure>`. If the image includes a title, it is placed in a `<figcaption>`.

## Directives

Directives extend Markdown with inline metadata. They begin with `@`, followed by a name, and enclose properties in braces.

```markdown
@info{type=warning title="Caution!" body="This is a warning note."}
```

- **Start**: `@` immediately followed by a name.
- **Name**: must begin with a letter or underscore; may include letters, digits, underscores, or hyphens.
- **Body**: braces `{ … }` enclose zero or more properties.
- **Property**: a key with an optional value.
    - Keys follow the same rules as names.
    - Values are assigned with `=`, but the `=` may be omitted.
    - A key with `=` but no value is interpreted as `'true'`.
    - Quoted values (with `'` or `"`) may contain spaces.
    - Unquoted values end at the next space or newline.
- **Separation**: properties are separated by spaces or newlines.
- **End**: the directive closes with `}`.

### `@disclosure`

| Attribute | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| `summary` | string  | Text for `<summary>` (default: "more") |
| `body`    | string  | Content inside the disclosure          |
| `open`    | boolean | If `true`, the disclosure is expanded  |

### `@youtube`

| Attribute          | Type    | Description                            |
| ------------------ | ------- | -------------------------------------- |
| `id` or `series`\* | string  | YouTube video or series ID             |
| `caption`          | string  | Text for `<figcaption>` or `<summary>` |
| `disclosure`       | boolean | Wraps the frame in `<details>`         |

\* one of `id` or `series` must be provided

### `@video`

| Attribute    | Type    | Description                            |
| ------------ | ------- | -------------------------------------- |
| `src`\*      | string  | URL of the video file                  |
| `type`       | string  | MIME type (default: `video/mp4`)       |
| `caption`    | string  | Text for `<figcaption>` or `<summary>` |
| `disclosure` | boolean | Wraps the frame in `<details>`         |

\* `src` is required
