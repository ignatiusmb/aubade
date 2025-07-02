import type { Token } from './types.js';
import { escape as sanitize } from '../utils.js';
import { Parser } from './parser.js';

interface Options {
	tags?: {
		[type in Token['type']]?: (meta: Token['meta']) => string;
	};
}
export function markdown({ tags = {} }: Options = {}) {
	const map = {
		':document': () => 'html',
		'parent:html': () => 'div',
		'parent:heading': ({ level }) => `h${level}`,
		'parent:quote': () => 'blockquote',
		'block:code': () => 'pre',
		'block:list': () => 'ul',
		// 'parent:item': () => 'li',
		'parent:paragraph': () => 'p',
		'block:break': () => 'hr /',
		'inline:autolink': () => 'a',
		'inline:code': () => 'code',
		'inline:link': () => 'a',
		'inline:strong': () => 'strong',
		'inline:emphasis': () => 'em',
		'inline:strike': () => 's',
		'inline:text': () => '',
		...tags,
	} satisfies Options['tags'];

	function render(token: Token): string {
		const tag = map[token.type]!(token.meta);
		if (tag.endsWith(' /')) return `<${tag}>`;
		const children =
			'children' in token &&
			token.children.map(render).join(token.type === 'block:code' ? '\n' : '');
		if (!tag) return children || sanitize(token.text || '');

		const attributes = Object.entries(token.attr || {}).flatMap(([k, v]) =>
			v.length ? `${k}="${sanitize(v)}"` : [],
		);
		const start = tag + (attributes.length ? ' ' + attributes.join(' ') : '');
		return `<${start}>${children || sanitize(token.text || '')}</${tag}>`;
	}

	return (input: string) => {
		// const tokens = tokenize(input);
		const system = new Parser(input);
		return {
			tokens: system.tokenize(),
			html: () => system.root.children.map(render).join('\n'),
		};
	};
}
