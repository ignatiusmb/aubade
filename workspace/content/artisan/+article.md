---
rank: 1
title: /artisan
description: content processing tools for Aubade
---

the `/artisan` module provides Aubade's content processing utilities, the lightweight markdown compiler. it's designed to work on its own or alongside other Aubade components in any JavaScript environment.

> **here be dragons** — this feature is experimental. expect missing pieces and breaking changes as the compiler evolves.

Aubade implements [Libretto](/docs/libretto), a markdown dialect designed to keep documents readable while giving Aubade precise control over parsing and rendering. this section covers the compiler interface and customization hooks exposed through `/artisan`.

## engrave

```typescript
export function engrave(input: string): {
	tokens: Token[];
	html(): string;
};
```

`engrave()` is the default parser, pre-configured with Aubade's settings. use it for common cases where you don't need custom rendering.

```javascript
import { engrave } from 'aubade/artisan';

engrave('hello world').html();
// -> <p>hello world</p>
```

## forge

```typescript
interface Resolver<T extends Token = Token> {
	(panel: { token: T; render(token: Token): string; sanitize: typeof escape }): string;
}

export interface Options {
	renderer?: { [T in Token as T['type']]?: Resolver<T> };
}

export function forge(options: Options = {}): typeof engrave;
```

`forge()` creates a parser instance with custom rendering rules. use it when you need to override how specific tokens are transformed into HTML.

```javascript
import { engrave, forge } from 'aubade/artisan';

engrave('hello *world*').html();
// -> <p>hello <em>world</em></p>

const mark = forge({
	renderers: {
		'inline:emphasis': ({ token, render }) => `<i>${token.children.map(render).join('')}</i>`,
	},
});

mark('hello *world*').html();
// -> <p>hello <i>world</i></p>
```
