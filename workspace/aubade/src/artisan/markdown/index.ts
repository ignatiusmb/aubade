import { escape as sanitize } from '../utils.js';
import { compose, type Token } from './engine.js';

interface Resolver<T extends Token = Token> {
	(panel: { token: T; render(token: Token): string; sanitize(text: string): string }): string;
}

export interface Options {
	renderer?: { [T in Token as T['type']]?: Resolver<T> };
}

export function markdown({ renderer = {} }: Options = {}) {
	const resolver = {
		'parent:html': ({ token, render }) => `<div>${token.children.map(render).join('')}</div>`,
		'parent:heading': ({ token, render }) => {
			const tag = `h${token.meta.level}`;
			const attributes = Object.entries(token.attr || {})
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			const children = token.children.map(render).join('');
			return `<${tag} ${attributes}>${children}</${tag}>`;
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
		'inline:autolink': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr || {})
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			return `<a ${attributes}>${sanitize(token.text || '')}</a>`;
		},
		'inline:code': ({ token, sanitize }) => `<code>${sanitize(token.text || '')}</code>`,
		'inline:image': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr || {})
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			return `<img ${attributes} />`;
		},
		'inline:link': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr || {})
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			return `<a ${attributes}>${sanitize(token.text || '')}</a>`;
		},
		'modifier:strong': ({ token, render }) =>
			`<strong>${token.children.map(render).join('')}</strong>`,
		'modifier:emphasis': ({ token, render }) => `<em>${token.children.map(render).join('')}</em>`,
		'modifier:strike': ({ token, render }) => `<s>${token.children.map(render).join('')}</s>`,
		'inline:text': ({ token, sanitize }) => sanitize(token.text || ''),
		...renderer,
	} satisfies Options['renderer'];

	function render<T extends Token>(token: T): string {
		const resolve = resolver[token.type] as Resolver<T> | undefined;
		if (!resolve) throw new Error(`Unknown token type: ${token.type}`);
		return resolve({ render, sanitize, token });
	}

	return (input: string) => {
		const root = compose(input);
		return {
			root,
			html: () => root.children.map(render).join('\n'),
		};
	};
}
