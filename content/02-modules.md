---
title: Modules / API
---

Marqua provides a couple of modules and exports.

### Artisan

This isn't usually necessary, but in case you want to handle the markdown parsing and rendering by yourself, here's how you can tap into the `transform` function provided by the module.

```typescript
export interface Dataset {
  language?: string;
  lineStart?: number;
  title?: string;
}

export function transform(source: string, dataset: Dataset): string;
```

A simple example would be passing a raw source code as a string.

```javascript
import { transform } from 'marqua/artisan'

const source = `
interface User {
  id: number;
  name: string;
}

const user: User = {
  id: 0,
  name: 'User'
}
`;

transform(source, { language: 'typescript' });
```

### Browser

This is the browser module to hydrate and give interactivity to your HTML.

#### `hydrate`

```typescript
import type { ActionReturn } from 'svelte/action';

export function hydrate(node: HTMLElement, key: any): ActionReturn;
```

This function can be used to make the rendered code blocks from your markdown interactive, some of which are

- toggle code line numbers
- copy block to clipboard

Usage using [SvelteKit](https://kit.svelte.dev/) would simply be

```svelte
<script>
  import { hydrate } from 'marqua/browser';
  import { navigating } from '$app/stores';
</script>

<main use:hydrate={$navigating}>
  <!-- content here -->
</main>
```

Passing in the `navigating` store into the `key` parameter is used to trigger the update inside `hydrate` function and re-hydrate the DOM when the page changes but is not remounted.
