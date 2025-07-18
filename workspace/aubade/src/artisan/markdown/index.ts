import { escape as sanitize } from '../utils.js';
import { compose, type Token } from './engine.js';

interface Resolver<T extends Token = Token> {
	(panel: { token: T; render(token: Token): string; sanitize(text: string): string }): string;
}

export interface Options {
	renderer?: { [T in Token as T['type']]?: Resolver<T> };
}

export function forge({ renderer = {} }: Options = {}) {
	const resolver = {
		'aubade:comment': () => '',
		'aubade:html': ({ token, render }) => {
			const attributes = Object.entries(token.attr)
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			const children = token.children.map(render).join('');
			return `<${token.tag}${attributes ? ' ' + attributes : ''}>${children}</${token.tag}>`;
		},

		'block:heading': ({ token, render }) => {
			const tag = `h${token.meta.level}`;
			const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
				v.length ? `${k}="${sanitize(v)}"` : [],
			);
			const children = token.children.map(render).join('');
			return `<${tag} ${attributes.join(' ')}>${children}</${tag}>`;
		},
		'block:quote': ({ token, render }) => {
			return `<blockquote>${token.children.map(render).join('')}</blockquote>`;
		},
		'block:code': ({ token, render, sanitize }) => {
			const attributes = Object.entries(token.attr)
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			const children = token.children.map(render).join('\n');
			return `<pre${attributes ? ' ' + attributes : ''}>${children}</pre>`;
		},
		'block:list': ({ token, render }) => `<ul>${token.children.map(render).join('')}</ul>`,
		// 'block:item': ({ token, render }) => `<li>${token.children.map(render).join('')}</li>`,
		'block:paragraph': ({ token, render }) => {
			const children = token.children.map(render).join('');
			return `<p>${children || sanitize(token.text || '')}</p>`;
		},
		'block:break': () => `<hr />`,

		'inline:escape': ({ token, sanitize }) => `${sanitize(token.text)}`,
		'inline:autolink': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
				v.length ? `${k}="${sanitize(v)}"` : [],
			);
			return `<a ${attributes.join(' ')}>${sanitize(token.text || '')}</a>`;
		},
		'inline:break': () => `\n`,
		'inline:code': ({ token, sanitize }) => `<code>${sanitize(token.text || '')}</code>`,
		'inline:image': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
				v.length ? `${k}="${sanitize(v)}"` : [],
			);
			return `<img ${attributes.join(' ')} />`;
		},
		'inline:link': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
				v.length ? `${k}="${sanitize(v)}"` : [],
			);
			const children = token.children.map(render).join('');
			return `<a ${attributes.join(' ')}>${children}</a>`;
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
		const { children: tokens } = compose(input);
		return { tokens, html: () => tokens.map(render).join('\n') };
	};
}

export const engrave = forge();
export { forge as markdown };
