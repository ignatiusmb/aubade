---
rank: 5
title: /palette
description: artisan extensions for Aubade
---

the `/palette` module provides extensions to the `/artisan` content processing utilities. it includes additional markdown tokens and rendering rules, as well as syntax highlighting integration.

## highlight

```typescript
interface Dataset {
	file?: string;
	language?: string;
	start?: string; // line number to start from
	[data: string]: string | undefined;
}

export function highlight(source: string, dataset: Dataset): string;
```

`highlight()` exposes Aubade's syntax highlighter independently of the markdown compiler. use it for standalone code snippets or when integrating highlighting into third-party parsers.

```javascript
import { highlight } from 'aubade/artisan';

highlight('const x: number = 1;', { language: 'ts' });
```

or wire it into another parser:

```javascript
import { highlight } from 'aubade/artisan';
import markdown from 'markdown-it';

const marker = markdown({
	highlight: (src, language) => `<pre>${highlight(src, { language })}</pre>`,
});
```

## shiki

```typescript
import { shiki } from 'aubade/artisan';

await shiki.codeToHtml('const x = 1', { lang: 'ts' });
```

Aubade exposes the underlying [shiki](https://shiki.style/) highlighter instance. use this when you need full control over highlighting output.
