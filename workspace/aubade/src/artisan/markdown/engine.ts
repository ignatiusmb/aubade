import * as registry from './registry.js';

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
function contextualize(source: string): Cursor {
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

const dispatch = new Map([
	['<', [registry.comment, registry.markup]],
	['`', [registry.codeblock]],
	['#', [registry.heading]],
	['>', [registry.quote]],
	['-', [registry.divider, registry.list]],
	['*', [registry.divider, registry.list]],
	['_', [registry.divider]],
]);

/** create the root document from the source */
export function compose(source: string): { type: ':document'; children: Block[] } {
	const root = { type: ':document' as const, children: [] as Block[] };
	const input = source.trim();
	const tree = root.children;
	const stack = new Proxy({} as Context['stack'], {
		get(target, key: keyof Context['stack']) {
			const container = target[key] || [];
			target[key] = container as any;
			return target[key];
		},
	});

	let index = 0;
	while (index < input.length) {
		const cursor = contextualize(input.slice(index));
		if (cursor.eat('\n')) {
			for (const type of ['block:paragraph', 'block:quote'] as const) {
				while (stack[type].length) stack[type].pop();
			}
		}

		const start = input[index + cursor.index];
		const known = (start === '\\' && []) || dispatch.get(start);
		const rules = known || [registry.divider, registry.heading];
		const token = match({ cursor, stack, rules });
		if (token) {
			if (token !== tree[tree.length - 1]) tree.push(token);
		} else {
			const text = cursor.locate(/\n|$/).trim();
			cursor.eat('\n'); // eat the line feed

			const q = stack['block:paragraph'];
			if (q.length) q[q.length - 1].text += '\n' + text;
			else {
				const p = { type: 'block:paragraph' as const, children: [], text };
				tree.push(p), q.push(p);
			}
		}
		index += cursor.index;
	}

	for (const parent of tree) {
		if (parent.type !== 'block:paragraph' || !parent.text) continue;
		parent.children = annotate(parent.text);
		// @TODO: make it configurable
		delete parent.text; // cleanup text after inline parsing
	}

	return root;
}

/** construct inline tokens from the source */
export function annotate(source: string): Annotation[] {
	const tree: Annotation[] = [];
	const stack = new Proxy({} as Context['stack'], {
		get(target, key: keyof Context['stack']) {
			const container = target[key] || [];
			target[key] = container as any;
			return target[key];
		},
	});

	let index = 0;
	const cursor = contextualize(source);
	while (index < source.length) {
		cursor.index = index;
		const token = match({
			cursor,
			stack,
			rules: [
				// order matters
				registry.linebreak,
				registry.escape,
				registry.comment,
				registry.codespan,
				registry.autolink,
				registry.image,
				registry.link,
				registry.strong,
				registry.emphasis,
				registry.strike,
			],
		});
		if (token) tree.push(token);
		else {
			const char = cursor.read(1);
			const last = tree[tree.length - 1];
			if (last?.type === 'inline:text') last.text += char;
			else tree.push({ type: 'inline:text', text: char });
		}
		index = cursor.index;
	}
	return tree;
}

const is = {
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

type Dispatch = { [T in Token as T['type']]: T };
export interface Context {
	annotate: typeof annotate;
	compose: typeof compose;

	cursor: Cursor;
	is: typeof is;
	stack: { [K in keyof Dispatch]: Dispatch[K][] };
}

function match<Rules extends Registry[]>({
	cursor,
	rules,
	stack,
}: {
	cursor: Cursor;
	rules: Rules;
	stack: Context['stack'];
}): null | ReturnType<Rules[number]> {
	const start = cursor.index;
	for (const rule of rules) {
		const token = rule({
			annotate,
			compose,
			is,
			cursor,
			stack,
		}) as ReturnType<Rules[number]>;
		if (token != null) return token;
		cursor.index = start;
	}
	return null;
}
