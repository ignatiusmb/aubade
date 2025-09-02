import type { Token } from './registry.js';
import { escape } from '../utils.js';
import { compose } from './engine.js';

interface Resolver<T extends Token = Token> {
	(panel: { token: T; render(token: Token): string; sanitize: typeof escape }): string;
}

export interface Options {
	quotes?: 'original' | 'typewriter' | 'typographic';
	renderer?: { [T in Token as T['type']]?: Resolver<T> };
}

export const engrave = forge({
	renderer: {
		'block:code'({ token, render, sanitize }) {
			const attributes = Object.entries(token.attr)
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			const children = token.children.map(render).join('\n');
			return `<pre${attributes ? ' ' + attributes : ''}>${children}</pre>`;
		},
	},
});
export function forge({ renderer = {} }: Options = {}) {
	const resolver = {
		'aubade:comment': () => '',
		'aubade:html': ({ token, render, sanitize }) => {
			const { tag } = token.meta;
			const attributes = Object.entries(token.attr)
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			const children = token.children.map(render).join('');
			return `<${tag}${attributes ? ' ' + attributes : ''}>${children}</${tag}>`;
		},

		'block:break': () => `<hr />`,
		'block:heading': ({ token, render, sanitize }) => {
			const tag = `h${token.meta.level}`;
			const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
				v.length ? `${k}="${sanitize(v)}"` : [],
			);
			const children = token.children.map(render).join('');
			return `<${tag} ${attributes.join(' ')}>${children}</${tag}>`;
		},
		'block:code': ({ token, render, sanitize }) => {
			const attributes = Object.entries(token.attr)
				.flatMap(([k, v]) => (v.length ? `${k}="${sanitize(v)}"` : []))
				.join(' ');
			const children = token.children.map(render).join('\n');
			return `<pre${attributes ? ' ' + attributes : ''}>${children}</pre>`;
		},
		'block:quote': ({ token, render }) => {
			const children = token.children.map(render).join('\n');
			const body = children ? '\n' + children + '\n' : '\n';
			return `<blockquote>${body}</blockquote>`;
		},
		'block:list': ({ token, render }) => {
			const { ordered } = token.meta;
			const tag = ordered ? 'ol' : 'ul';
			const start = ordered && ordered !== 1 ? ` start="${ordered}"` : '';
			return `<${tag}${start}>\n${token.children.map(render).join('\n')}\n</${tag}>`;
		},
		'block:item': ({ token, render }) => {
			const [first, ...rest] = token.children;
			const pad = rest.length || (first && first.type !== 'block:paragraph') ? '\n' : '';
			const body = !pad && first?.type === 'block:paragraph' ? first : token;
			return `<li>${pad}${body.children.map(render).join(pad)}${pad}</li>`;
		},
		'block:image': ({ token, render, sanitize }) => {
			const img = `<img src="${sanitize(token.attr.src)}" alt="${sanitize(token.attr.alt)}" />`;
			const title = token.children.map(render).join('');
			const caption = title ? `\n<figcaption>${title}</figcaption>` : '';
			return `<figure>\n${img}${caption}\n</figure>`;
		},
		'block:paragraph': ({ token, render }) => `<p>${token.children.map(render).join('')}</p>`,

		'inline:escape': ({ token, sanitize }) => `${sanitize(token.text)}`,
		'inline:autolink': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
				v.length ? `${k}="${sanitize(v)}"` : [],
			);
			return `<a ${attributes.join(' ')}>${sanitize(token.text || '')}</a>`;
		},
		'inline:break': () => '<br />\n',
		'inline:code': ({ token, sanitize }) => {
			return `<code>${sanitize(token.text.replace(/&/g, '&amp;') || '')}</code>`;
		},
		'inline:image': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
				v.length ? `${k}="${sanitize(v)}"` : [],
			);
			return `<img ${attributes.join(' ')} />`;
		},
		'inline:link': ({ token, sanitize }) => {
			const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
				k === 'href' || v.length ? `${k}="${sanitize(v)}"` : [],
			);
			const children = token.children.map(html).join('');
			return `<a ${attributes.join(' ')}>${children}</a>`;
		},

		'inline:emphasis': ({ token, render }) => `<em>${token.children.map(render).join('')}</em>`,
		'inline:strike': ({ token, render }) => `<s>${token.children.map(render).join('')}</s>`,
		'inline:strong': ({ token, render }) =>
			`<strong>${token.children.map(render).join('')}</strong>`,
		'inline:text': ({ token, sanitize }) => sanitize(token.text || ''),
		...renderer,
	} satisfies Options['renderer'];

	function html<T extends Token>(token: T): string {
		const resolve = resolver[token.type] as Resolver<T> | undefined;
		if (!resolve) throw new Error(`Unknown token type: ${token.type}`);
		return resolve({ token, render: html, sanitize: escape });
	}

	return (input: string) => {
		const { children: tokens } = compose(input);
		return { tokens, html: () => tokens.map(html).join('\n') };
	};
}
