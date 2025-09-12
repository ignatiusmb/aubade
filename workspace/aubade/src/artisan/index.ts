import type { Token } from './registry.js';
import { escape } from './utils.js';
import { annotate, compose } from './engine.js';
import { base, standard } from './resolver.js';

export type Director = (panel: {
	data: Extract<Token, { type: 'aubade:directive' }>['meta']['data'];
	annotate: typeof annotate;
	print(...lines: Array<string | false>): string;
	render(token: Token): string;
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
	quotes?: 'original' | 'typewriter' | 'typographic';
}

export const engrave = forge({});
export function forge({ directive = {}, renderer = {} }: Options = {}) {
	const resolver = {
		...standard,
		...renderer,

		'aubade:directive'({ token: { meta }, render, sanitize }) {
			const transform = { ...base, ...directive }[meta.type];
			if (!transform) throw new Error(`Unknown directive type: ${meta.type}`);
			return transform({
				data: meta.data,
				annotate,
				render,
				sanitize,
				print(...lines) {
					return lines.flatMap((l) => (!l ? [] : l)).join('\n');
				},
			});
		},
	} satisfies Options['renderer'];

	return (input: string) => {
		let { children: stream } = compose(input);
		return {
			get tokens() {
				return stream;
			},
			set tokens(v) {
				stream = v;
			},

			html(override: Options['renderer'] = {}) {
				function html<T extends Token['type']>(token: Extract<Token, { type: T }>): string {
					delete override['aubade:directive']; // prevent override of directives
					const resolve: Resolver<T> = { ...resolver, ...override }[token.type] as any;
					if (!resolve) throw new Error(`Unknown token type: ${token.type}`);
					return resolve({ token, render: html, sanitize: escape });
				}
				return stream.map(html).join('\n');
			},
			visit(map: {
				[T in Token['type']]?: (
					token: Extract<Token, { type: T }>,
					parent?: Token,
				) => Extract<Token, { type: T }>;
			}): typeof stream {
				function walk<T extends Token>(token: T, parent?: Token): T {
					if ('children' in token) {
						const visited = token.children.map((child) => walk(child, token));
						token.children = visited as typeof token.children;
					}
					type Visitor = (token: T, parent?: Token) => T;
					const visitor: Visitor = map[token.type] as any;
					return visitor ? visitor(token, parent) : token;
				}
				return stream.map((token) => walk(token));
			},
		};
	};
}
