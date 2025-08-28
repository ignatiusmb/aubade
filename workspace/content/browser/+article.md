---
rank: 7
title: /browser
description: framework-agnostic hydration for Aubade
---

the `/browser` module provides a `hydrate()` function that attaches interactivity to rendered markdown — such as toggling line numbers and copying code blocks to the clipboard.

```typescript
export function hydrate(signal: any): (node: HTMLElement) => () => void;
```

`hydrate()` is designed to be framework-agnostic, but the usage shown here is optimized for [Svelte 5 with SvelteKit](https://svelte.dev/docs/kit/introduction). you can adapt it to any environment that supports mount/unmount hooks or action-like lifecycles.

```svelte file:+layout.svelte
<script>
	import { hydrate } from 'aubade/browser';
	import { navigating } from '$app/state';
</script>

<main {@attach hydrate(navigating.from)}>
	<!-- content here -->
</main>
```

the `{@attach}` directive calls `hydrate()` after the `<main>` element mounts. passing `navigating.from` ensures hydration re-runs when navigating between pages without a full remount, so code block features remain active across client-side transitions.
