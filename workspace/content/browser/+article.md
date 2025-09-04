---
rank: 7
title: /browser
description: framework-agnostic hydration for Aubade
---

the `/browser` module provides client-side hydration utilities. it exposes a single `hydrate()` function that attaches interactivity to markdown rendered from [`engrave()`](/docs/artisan#engrave), enabling features such as toggling line numbers or copying code blocks to the clipboard.

## hydrate

```typescript
export function hydrate(signal: any): (node: HTMLElement) => () => void;
```

`hydrate()` is framework-agnostic. it returns a function that runs after the element is mounted, and provides a cleanup function that runs on unmount. use it in any environment that supports mount/unmount hooks.

the example below shows usage with [Svelte 5 and SvelteKit](https://svelte.dev/docs/kit/introduction):

```svelte file:+layout.svelte
<script>
	import { hydrate } from 'aubade/browser';
	import { navigating } from '$app/state';
</script>

<main {@attach hydrate(navigating.from)}>
	<!-- content here -->
</main>
```

the `{@attach}` directive calls `hydrate()` once the `<main>` element mounts. passing `navigating.from` ensures hydration re-runs on client-side navigation, so code block features remain active across page transitions.
