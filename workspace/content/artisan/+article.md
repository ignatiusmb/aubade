---
rank: 1
title: /artisan
---

the `/artisan` module provides tools for content processing, including a markdown compiler and a syntax highlighter. built from the ground up to be lightweight and efficient, use it together with the other modules or independently in any JavaScript environment.

## markdown

> **here be dragons** — this feature is experimental. expect missing pieces and breaking changes as the compiler evolves.

Aubade ships its own markdown compiler, built around its [AubadeMark](/docs/spec) spec. this makes markdown source more terse and output more flexible. unlike existing parsers, AubadeMark integrates tightly with Aubade's content primitives, giving predictable token structures, convenient asset handling, and full control over rendering. for a complete list of quirks, differences, and advanced features, see the [spec page](/docs/spec).

### engrave

```typescript
export function engrave(input: string): {
	tokens: Token[];
	html(): string;
};
```

a pre-initialized parser with Aubade's defaults. use this if you don't need customization.

```typescript
import { engrave } from 'aubade/artisan';

engrave('hello world').html();
// -> <p>hello world</p>
```

### forge

```typescript
interface Resolver<T extends Token = Token> {
	(panel: { token: T; render(token: Token): string; sanitize: typeof escape }): string;
}

export interface Options {
	renderer?: { [T in Token as T['type']]?: Resolver<T> };
}

export function forge(options: Options = {}): typeof engrave;
```

create a parser instance with custom options, overriding renderers for specific tokens. for example, to change how inline emphasis is rendered:

```typescript
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

## transform

low-level escape hatch: apply Aubade's syntax highlighter directly, without going through the markdown parser.

```typescript
interface Dataset {
	file?: string;
	language?: string;
	[data: string]: string | undefined;
}

export function transform(source: string, dataset: Dataset): string;
```

example: highlight standalone code.

```javascript
import { transform } from 'aubade/artisan';

transform('const x: number = 1;', { language: 'ts' });
```

or wire it into another parser:

```javascript
import { transform } from 'aubade/artisan';
import markdown from 'markdown-it';

const marker = markdown({
	highlight: (src, language) => transform(src, { language })
});
```

## highlighter

Aubade bundles a [shiki](https://shiki.style/) highlighter instance for code syntax highlighting.

```typescript
import { highlighter } from 'aubade/artisan';

await highlighter.codeToHtml('const x = 1', { lang: 'ts' });
```
