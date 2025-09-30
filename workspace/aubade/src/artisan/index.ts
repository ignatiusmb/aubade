import type { Token } from './registry.js';
import { util } from './context.js';
import { annotate, compose } from './engine.js';
import { base, standard } from './resolver.js';
import { escape } from './utils.js';

export type Director = (panel: {
	data: Extract<Token, { type: 'aubade:directive' }>['meta']['data'];
	annotate(source: string): string;
	print(...lines: Array<string | false>): string;
	sanitize: typeof escape;
}) => string;

export type Resolver<T extends Token['type'] = Token['type']> = (panel: {
	token: Extract<Token, { type: T }>;
	render(token: Token): string;
	sanitize: typeof escape;
}) => string;

export interface Options {
	directive?: { [key: string]: Director };
	renderer?: { [T in Token as T['type']]?: Resolver<T['type']> };
	transform?: { [T in Token as T['type']]?: (token: T) => T };
}

export const engrave = forge({
	transform: { 'inline:text': ({ type, text }) => ({ type, text: typography(text) }) },
});
export function forge({ directive = {}, renderer = {}, transform = {} }: Options = {}) {
	const resolver = {
		...standard,
		...renderer,

		'aubade:directive'({ token: { meta }, render, sanitize }) {
			const transform = { ...base, ...directive }[meta.type];
			if (!transform) throw new Error(`Unknown directive type: ${meta.type}`);
			return transform({
				data: meta.data,
				annotate: (source) => annotate(source).map(render).join(''),
				print: (...lines) => lines.flatMap((l) => (!l ? [] : l)).join('\n'),
				sanitize,
			});
		},
	} satisfies Options['renderer'];

	function walk<T extends Token>(token: T, visitors: Options['transform'] = {}): T {
		if ('children' in token) {
			const visited = token.children.map((child) => walk(child, visitors));
			token.children = visited as typeof token.children;
		}
		type Visitor = (token: T, parent?: Token) => T;
		const visitor = visitors[token.type] as Visitor | undefined;
		return visitor ? visitor(token) : token;
	}

	return (input: string) => {
		let { children: stream } = compose(input.replace(/\r\n?/g, '\n'));
		if (Object.keys(transform).length) stream = stream.map((t) => walk(t, transform));

		return {
			get tokens() {
				return stream;
			},
			set tokens(v) {
				stream = v;
			},

			html(overrides: Options['renderer'] = {}) {
				delete overrides['aubade:directive']; // prevent override of directives
				function html<T extends Token['type']>(token: Extract<Token, { type: T }>): string {
					const resolve: Resolver<T> = { ...resolver, ...overrides }[token.type] as any;
					if (!resolve) throw new Error(`Unknown token type: ${token.type}`);
					const visited = transform[token.type] ? walk(token, transform) : token;
					return resolve({ token: visited, render: html, sanitize: escape });
				}
				return stream.map(html).join('\n');
			},
			visit(visitors: Options['transform']): typeof stream {
				return stream.map((token) => walk(token, visitors));
			},
		};
	};
}

export function typography(text: string): string {
	let output = '';
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (char !== "'" && char !== '"') {
			output += char;
			continue;
		}

		const prev = text[i - 1];
		const next = text[i + 1];

		const prime = /\d/.test(prev);
		const left = util.is['left-flanking'](prev || ' ', next || ' ');
		const right = util.is['right-flanking'](prev || ' ', next || ' ');

		const double = right ? (prime ? '″' : '”') : left ? '“' : char;
		const single = right ? (prime ? '′' : '’') : left ? '‘' : char;
		output += char === '"' ? double : single;
	}
	output = output.replace(/---/g, '—').replace(/--/g, '–');
	return output.replace(/\.{3,}/g, '…');
}
