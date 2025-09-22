import type { Token } from './registry.js';
import { annotate, compose } from './engine.js';

export function contextualize(source: string) {
	let pointer = 0;

	return {
		/** current index in the source */
		get index() {
			return pointer;
		},
		set index(value) {
			pointer = value;
		},

		/** consume the input if it matches */
		eat(text: string): boolean {
			if (text.length === 1) return source[pointer] === text && !!++pointer;
			if (text !== source.slice(pointer, pointer + text.length)) return false;
			pointer += text.length;
			return true;
		},
		/** read a fixed number of characters */
		read(length: number): string {
			if (length === 1) return source[pointer++];
			const text = source.slice(pointer, pointer + length);
			pointer += text.length;
			return text;
		},
		/** eat until `pattern` is found */
		locate(pattern: RegExp): string {
			const start = pointer;
			const match = pattern.exec(source.slice(pointer));
			if (match) {
				pointer = start + match.index;
				return source.slice(start, pointer);
			}
			return '';
		},
		/** see the `pattern` ahead */
		peek(pattern: string | RegExp): string {
			if (typeof pattern === 'string') {
				if (pattern.length === 1) return source[pointer] === pattern ? pattern : '';
				return source.slice(pointer, pointer + pattern.length) === pattern ? pattern : '';
			}
			const match = pattern.exec(source.slice(pointer));
			return match ? source.slice(pointer, pointer + match.index) : '';
		},
		/** see the `n`-th character before/after */
		see(n: number): string {
			if (n === 0) return source[pointer] || ' ';
			const index = pointer + n;
			// treat out-of-bounds as whitespace
			if (n < 0 && index < 0) return ' ';
			if (index >= source.length) return ' ';
			return source[index];
		},

		trim(): void {
			while (pointer < source.length && /\s/.test(source[pointer])) {
				pointer++;
			}
		},
	};
}

function extract(token: Token): string {
	if ('children' in token) return token.children.map(extract).join('');
	return 'text' in token ? token.text : '';
}

export const util = {
	commit<T>(array: T[], item: T) {
		if (item !== util.last(array)) array.push(item);
		return item;
	},
	last<T>(array: T[]) {
		return array[array.length - 1];
	},

	is: {
		alphanumeric(char: string): boolean {
			return /\p{L}|\p{N}|_/u.test(char);
		},
		punctuation(char: string): boolean {
			return /\p{P}|\p{S}/u.test(char);
		},
		whitespace(char: string): boolean {
			return /\p{Zs}/u.test(char) || /\s/.test(char);
		},

		'left-flanking'(before: string, after: string): boolean {
			return (
				!util.is.whitespace(after) &&
				(!util.is.punctuation(after) || util.is.whitespace(before) || util.is.punctuation(before))
			);
		},
		'right-flanking'(before: string, after: string): boolean {
			return (
				!util.is.whitespace(before) &&
				(!util.is.punctuation(before) || util.is.whitespace(after) || util.is.punctuation(after))
			);
		},
	},
};
export function match<Rules extends Array<(ctx: Context) => unknown>>(ctx: {
	cursor: ReturnType<typeof contextualize>;
	rules: Rules;
	stack: Context['stack'];
}): null | ReturnType<Rules[number]> {
	const start = ctx.cursor.index;
	for (const rule of ctx.rules) {
		const token = rule({
			annotate,
			compose,
			extract,
			cursor: ctx.cursor,
			stack: ctx.stack,
			util,
		}) as null | ReturnType<Rules[number]>;
		if (token != null) return token;
		ctx.cursor.index = start;
	}
	return null;
}

export interface Context {
	annotate: typeof annotate;
	compose: typeof compose;
	extract: typeof extract;

	cursor: ReturnType<typeof contextualize>;
	stack: { [T in Token as T['type']]: T[] };
	util: typeof util;
}
