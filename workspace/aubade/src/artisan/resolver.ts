import type { Options } from './index.js';

export const base = {
	youtube({ data, annotate, print, render, sanitize }) {
		const id = sanitize(data.id || '');
		const src = `https://www.youtube-nocookie.com/embed/${id}`;
		const attributes = [
			'title="YouTube video player"',
			'frameborder="0"',
			'allowfullscreen',
			'allow="autoplay; encrypted-media"',
		];
		return print(
			'<figure>',
			`<iframe src="${src}" ${attributes.join(' ')}></iframe>`,
			data.caption && `<figcaption>${annotate(data.caption).map(render)}</figcaption>`,
			'</figure>',
		);
	},
} satisfies Options['directive'];

export const standard = {
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
	'block:code': ({ token, sanitize }) => {
		const { 'data-language': lang } = token.attr;
		const attr = lang ? ` data-language="${sanitize(lang)}"` : '';
		const nl = token.meta.code.length && !token.meta.code.endsWith('\n') ? '\n' : '';
		const code = sanitize(token.meta.code.replace(/&/g, '&amp;'));
		return `<pre${attr}><code>${code}${nl}</code></pre>`;
	},
	'block:quote': ({ token, render }) => {
		const children = token.children.map(render).join('\n');
		const body = children ? '\n' + children + '\n' : '\n';
		return `<blockquote>${body}</blockquote>`;
	},
	'block:list': ({ token, render }) => {
		const { ordered } = token.meta;
		const tag = ordered !== false ? 'ol' : 'ul';
		const start = tag === 'ol' && ordered !== 1 ? ` start="${ordered}"` : '';
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

	'inline:break': () => '<br />\n',
	'inline:escape': ({ token, sanitize }) => `${sanitize(token.text)}`,
	'inline:autolink': ({ token, sanitize }) => {
		const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
			v.length ? `${k}="${sanitize(v)}"` : [],
		);
		return `<a ${attributes.join(' ')}>${sanitize(token.text || '')}</a>`;
	},
	'inline:code': ({ token, sanitize }) => {
		return `<code>${sanitize(token.text.replace(/&/g, '&amp;') || '')}</code>`;
	},
	'inline:image': ({ token, sanitize }) => {
		const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
			v.length ? `${k}="${sanitize(v)}"` : [],
		);
		return `<img ${attributes.join(' ')} />`;
	},
	'inline:link': ({ token, render, sanitize }) => {
		const attributes = Object.entries(token.attr).flatMap(([k, v]) =>
			k === 'href' || v.length ? `${k}="${sanitize(v)}"` : [],
		);
		const children = token.children.map(render).join('');
		return `<a ${attributes.join(' ')}>${children}</a>`;
	},

	'inline:emphasis': ({ token, render }) => `<em>${token.children.map(render).join('')}</em>`,
	'inline:strike': ({ token, render }) => `<del>${token.children.map(render).join('')}</del>`,
	'inline:strong': ({ token, render }) => `<strong>${token.children.map(render).join('')}</strong>`,
	'inline:text': ({ token, sanitize }) => sanitize(token.text || ''),
} satisfies Options['renderer'];
