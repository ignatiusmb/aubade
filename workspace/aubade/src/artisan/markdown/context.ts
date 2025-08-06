import type * as registry from './registry.js';
import { annotate, compose } from './engine.js';

type Registry = [
	// aubade registries
	typeof registry.comment,
	typeof registry.markup,

	// block registries
	typeof registry.codeblock,
	typeof registry.divider,
	typeof registry.heading,
	typeof registry.list,
	typeof registry.quote,
	() => { type: 'block:paragraph'; children: Annotation[]; text?: string },

	// inline registries
	typeof registry.escape,
	typeof registry.linebreak,
	typeof registry.autolink,
	typeof registry.codespan,
	typeof registry.image,
	typeof registry.link,
	typeof registry.strong,
	typeof registry.emphasis,
	typeof registry.strike,
	() => { type: 'inline:text'; text: string },
][number];
export type Token = Registry extends (...args: any[]) => infer R ? NonNullable<R> : never;
export type Annotation = Extract<Token, { type: `${'aubade' | 'inline' | 'modifier'}:${string}` }>;
export type Block = Extract<Token, { type: `${'aubade' | 'block'}:${string}` }>;

interface Cursor {
	/** current index in the source */
	index: number;

	/** greedily consume until the last matching character */
	consume(delimiter: string, update: (i: number) => boolean): string;
	/** consume the input if it matches */
	eat(text: string): boolean;
	/** read a fixed number of characters */
	read(length: number): string;
	/** eat until `pattern` is found */
	locate(pattern: RegExp): string;
	/** see the `pattern` ahead */
	peek(pattern: string | RegExp): string;
	/** see the `n`-th character before/after */
	see(n: number): string;

	trim(): void;
}
export function contextualize(source: string): Cursor {
	let pointer = 0;

	return {
		get index() {
			return pointer;
		},
		set index(value) {
			pointer = value;
		},

		consume(delimiter, update) {
			let i = pointer;
			let last = -1;

			while (i < source.length) {
				if (i + delimiter.length > source.length) break;
				const text = delimiter.length === 1 ? source[i] : source.slice(i, i + delimiter.length);
				const result = update(i - pointer);
				if (text === delimiter && result) last = i;
				i++;
			}

			if (last === -1) return '';
			const result = source.slice(pointer, last);
			pointer = last;
			return result;
		},
		eat(text) {
			if (text.length === 1) return source[pointer] === text && !!++pointer;
			if (text !== source.slice(pointer, pointer + text.length)) return false;
			pointer += text.length;
			return true;
		},
		read(length) {
			if (length === 1) return source[pointer++];
			const text = source.slice(pointer, pointer + length);
			pointer += text.length;
			return text;
		},
		locate(pattern) {
			const start = pointer;
			const match = pattern.exec(source.slice(pointer));
			if (match) {
				pointer = start + match.index;
				return source.slice(start, pointer);
			}
			return '';
		},
		peek(pattern) {
			if (typeof pattern === 'string') {
				if (pattern.length === 1) return source[pointer] === pattern ? pattern : '';
				return source.slice(pointer, pointer + pattern.length) === pattern ? pattern : '';
			}
			const match = pattern.exec(source.slice(pointer));
			return match ? source.slice(pointer, pointer + match.index) : '';
		},
		see(n) {
			if (n === 0) return source[pointer];
			const index = pointer + n;
			// treat out-of-bounds as whitespace
			if (n < 0 && index < 0) return ' ';
			if (index >= source.length) return ' ';
			return source[index];
		},

		trim() {
			while (pointer < source.length && /\s/.test(source[pointer])) {
				pointer++;
			}
		},
	};
}

export const is = {
	'left-flanking'(before: string, after: string): boolean {
		return (
			!is.whitespace(after) &&
			(!is.punctuation(after) || is.whitespace(before) || is.punctuation(before))
		);
	},
	'right-flanking'(before: string, after: string): boolean {
		return (
			!is.whitespace(before) &&
			(!is.punctuation(before) || is.whitespace(after) || is.punctuation(after))
		);
	},

	alphanumeric(char: string): boolean {
		return /\p{L}|\p{N}|_/u.test(char);
	},
	punctuation(char: string): boolean {
		return /\p{P}|\p{S}/u.test(char);
	},
	whitespace(char: string): boolean {
		return /\p{Zs}/u.test(char) || /\s/.test(char);
	},
};
export function match<Rules extends Registry[]>(ctx: {
	cursor: Cursor;
	rules: Rules;
	stack: Context['stack'];
}): null | ReturnType<Rules[number]> {
	const start = ctx.cursor.index;
	for (const rule of ctx.rules) {
		const token = rule({
			annotate,
			compose,
			is,
			cursor: ctx.cursor,
			stack: ctx.stack,
		}) as ReturnType<Rules[number]>;
		if (token != null) return token;
		ctx.cursor.index = start;
	}
	return null;
}

export interface Context {
	annotate: typeof annotate;
	compose: typeof compose;

	cursor: Cursor;
	is: typeof is;
	stack: { [T in Token as T['type']]: T[] };
}
