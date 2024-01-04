---
title: Introduction
---

Marqua is an enhanced markdown compiler with code syntax highlighting and built-in front matter parser that splits your markdown into two parts, `content` and `metadata`. The generated output is highly adaptable to be used with any framework and designs of your choice as it is just JSON.

The markdown compiler is powered by [markdown-it](https://github.com/markdown-it/markdown-it) and code syntax highlighter is powered by [Shikiji](https://github.com/antfu/shikiji).

The front matter parser for the `metadata` is powered by a lightweight implementation in-house, which supports a minimal subset of [YAML](https://yaml.org/) syntax and can be used as a standalone module.

### Quick Start

```
pnpm install marqua
```

Use the functions from the FileSystem module to `compile` a file or `traverse` directories.

```javascript
import { compile, traverse } from 'marqua/fs';

compile(/* string */, /* optional hydrate callback */);
traverse(/* options */, /* optional hydrate callback */);
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
