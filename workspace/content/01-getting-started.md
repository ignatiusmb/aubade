---
title: Getting Started
---

Start by installing Marqua from the npm registry

```
pnpm install marqua
```

If you're using any code blocks in your markdown, make sure to include the stylesheets from `/styles` to your app, which you can do in either a JS file or a CSS file.

```javascript
// process with JS bundler
import 'marqua/styles/code.css';
```

```css
/* process with CSS bundler */
@import 'marqua/styles/code.css';
```

Use the functions from the [`/fs` module](/docs/module-fs) to `compile` a file or `traverse` directories.

```javascript
import { compile, traverse } from 'marqua/fs';

const article = compile(/* path to your file */);

const data = traverse(/* options */, /* hydrate callback */);
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
