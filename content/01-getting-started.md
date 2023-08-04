---
title: Getting Started
---

```
pnpm install marqua
```

### Include base styles

Make sure to include the stylesheets from `/styles` to your app

```svelte
<script>
	// process with JS bundler
	import 'marqua/styles/code.css';
</script>

<!-- choose one but not both -->

<style>
	/* process with CSS bundler */
	@import 'marqua/styles/code.css';
</style>
```

The following CSS variables are made available and can be modified as needed

```css
:root {
	--font-default: 'Rubik', 'Ubuntu', 'Helvetica Neue', sans-serif;
	--font-heading: 'Karla', sans-serif;
	--font-monospace: 'Fira Code', 'Inconsolata', 'Consolas', monospace;

	--mrq-rounding: 0.3rem;
	--mrq-tab-size: 2;

	--mrq-primary: #0070bb;
	--mrq-bg-dark: #2d2d2d;
	--mrq-bg-light: #f7f7f7;
	--mrq-cl-dark: #242424;
	--mrq-cl-light: #dadada;
}

.mrq[data-mrq='block'],
.mrq[data-mrq='header'],
.mrq[data-mrq='pre'] {
	--mrq-pre-bg: #525252;
	--mrq-bounce: 10rem;
	--mrq-tms: 100ms;
	--mrq-tfn: cubic-bezier(0.6, -0.28, 0.735, 0.045);
}

.mrq[data-mrq='header'] {
	--mrq-hbg-dark: #323330;
	--mrq-hbg-light: #feefe8;
}
```
