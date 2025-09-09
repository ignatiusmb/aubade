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

		'aubade:directive'({ token: { meta } }) {
			const fn = { ...base, ...directive }[meta.type];
			if (!fn) throw new Error(`Unknown directive type: ${meta.type}`);
			return fn({
				data: meta.data,
				annotate,
				print: (...lines) => lines.flatMap((l) => (!l ? [] : l)).join('\n'),
				render: html,
				sanitize: escape,
			});
		},
	} satisfies Options['renderer'];

	function html<T extends Token['type']>(token: Extract<Token, { type: T }>): string {
		const resolve = resolver[token.type] as unknown as Resolver<T> | undefined;
		if (!resolve) throw new Error(`Unknown token type: ${token.type}`);
		return resolve({ token, render: html, sanitize: escape });
	}

	return (input: string) => {
		const { children: tokens } = compose(input);
		return { tokens, html: () => tokens.map(html).join('\n') };
	};
}
