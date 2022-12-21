---
title: Module / Browser
---

### hydrate

This is the browser module to hydrate and give interactivity to your HTML.

```typescript
import type { ActionReturn } from 'svelte/action';

export function hydrate(node: HTMLElement, key: any): ActionReturn;
```

The `hydrate` function can be used to make the rendered code blocks from your markdown interactive, some of which are

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
