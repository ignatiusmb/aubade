---
title: Introduction
---

Marqua is a compiler for markdown with code syntax highlighting powered by [markdown-it](https://github.com/markdown-it/markdown-it) and [Shiki](https://github.com/shikijs/shiki).

### Quick Start

```bash
pnpm install marqua
```

```javascript
~Use as highlighter function
import MarkdownIt from 'markdown-it';
import { transform } from 'marqua/artisan';

// passing as a 'markdown-it' options
const marker = MarkdownIt({
  highlight: (str, language) => transform(str, { language });
});
```

```svelte
~Hydrating the toolbar buttons
<script>
  import { hydrate } from 'marqua/browser';
</script>

<main use:hydrate>
  <!-- content here -->
</main>
```
