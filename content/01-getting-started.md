---
title: Getting Started
---


```bash
~Install via a package manager
pnpm install marqua
```

### Include base styles

Make sure to include these stylesheets to your app

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

The following CSS variables will be made available

```css
:root {
  --font-default: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Rubik', 'Ubuntu', 'Roboto', sans-serif;
  --font-heading: 'Karla', sans-serif;
  --font-monospace: 'Fira Code', 'Inconsolata', 'Consolas', monospace;
}
```

```html
~Use your own binaries or through CDN
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Fira+Code&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inconsolata&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karla&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Ubuntu&display=swap">
```
