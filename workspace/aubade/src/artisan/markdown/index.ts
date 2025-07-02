import type { Token } from './types.js';
import { escape as sanitize } from '../utils.js';
import { Parser } from './parser.js';

interface Panel<T extends Token = Token> {
	render(token: Token): string;
	sanitize(text: string): string;
	token: T;
}

type Resolver<T extends Token = Token> = (panel: Panel<T>) => string;

export interface Options {
	renderer?: { [T in Token as T['type']]?: Resolver<T> };
}
export function markdown({ renderer = {} }: Options = {}) {
	const resolver = {
		':document': ({ token, render }) => token.children.map(render).join('\n'),
		'parent:html': ({ token, render }) => `<div>${token.children.map(render).join('')}</div>`,
		'parent:heading': ({ token, render }) => {
			const tag = `h${token.meta.level}`;
			const attributes = Object.entries(token.attr || {})
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			const children = token.children.map(render).join('');
			return `<${tag}${attributes ? ' ' + attributes : ''}>${children}</${tag}>`;
		},
		'parent:quote': ({ token, render }) => {
			return `<blockquote>${token.children.map(render).join('')}</blockquote>`;
		},
		'block:code': ({ token, render, sanitize }) => {
			const attributes = Object.entries(token.attr || {})
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			const children = token.children.map(render).join('\n');
			return `<pre${attributes ? ' ' + attributes : ''}>${children}</pre>`;
		},
		'block:list': ({ token, render }) => `<ul>${token.children.map(render).join('')}</ul>`,
		// 'parent:item': ({ token, render }) => `<li>${token.children.map(render).join('')}</li>`,
		'parent:paragraph': ({ token, render }) => {
			const children = token.children.map(render).join('');
			return `<p>${children || sanitize(token.text || '')}</p>`;
		},
		'block:break': () => `<hr />`,
		'inline:autolink': ({ token, sanitize }) =>
			`<a href="${sanitize(token.text || '')}">${sanitize(token.text || '')}</a>`,
		'inline:code': ({ token, sanitize }) => `<code>${sanitize(token.text || '')}</code>`,
		'inline:link': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr || {})
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			return `<a${attributes ? ' ' + attributes : ''}>${sanitize(token.text || '')}</a>`;
		},
		'inline:strong': ({ token, render, sanitize }) => {
			const children = token.children.map(render).join('');
			return `<strong>${children || sanitize(token.text || '')}</strong>`;
		},
		'inline:emphasis': ({ token, render, sanitize }) => {
			const children = token.children.map(render).join('');
			return `<em>${children || sanitize(token.text || '')}</em>`;
		},
		'inline:strike': ({ token, render, sanitize }) => {
			const children = token.children.map(render).join('');
			return `<s>${children || sanitize(token.text || '')}</s>`;
		},
		'inline:text': ({ token, sanitize }) => sanitize(token.text || ''),
		...renderer,
	} satisfies Options['renderer'];

	function render<T extends Token>(token: T): string {
		const resolve = resolver[token.type] as Resolver<T> | undefined;
		if (!resolve) throw new Error(`Unknown token type: ${token.type}`);
		return resolve({ render, sanitize, token });
	}

	return (input: string) => {
		const system = new Parser(input);
		return {
			root: system.tokenize(),
			html: () => system.root.children.map(render).join('\n'),
		};
	};
}
