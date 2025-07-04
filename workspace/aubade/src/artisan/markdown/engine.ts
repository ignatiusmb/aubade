import * as block from './registry/block.js';
import * as inline from './registry/inline.js';
import * as modifier from './registry/modifier.js';
import * as parent from './registry/parent.js';

type Registry = [
	typeof parent.html,
	typeof block.linebreak,
	typeof parent.heading,
	typeof parent.quote,
	typeof block.list,
	typeof block.code,
	typeof parent.paragraph,

	typeof inline.comment,
	typeof inline.escape,
	typeof inline.autolink,
	typeof inline.code,
	typeof inline.image,
	typeof inline.link,
	typeof modifier.strong,
	typeof modifier.emphasis,
	typeof modifier.strike,
	typeof inline.text,
][number];
export type Token = Registry extends (...args: any[]) => infer R ? NonNullable<R> : never;
export type Dispatch = { [T in Token as T['type']]: T };

const dispatch = new Map([
	['<', [parent.html]],
	['`', [block.code]],
	['#', [parent.heading]],
	['>', [parent.quote]],
	['-', [block.linebreak, block.list]],
	['*', [block.linebreak, block.list]],
	['_', [block.linebreak]],
	['\\', [parent.paragraph]],
] as ReadonlyArray<readonly [string, Registry[]]>);

const tidbits = [
	inline.escape,
	inline.comment,
	inline.code,
	inline.autolink,
	inline.image,
	inline.link,
	modifier.strong,
	modifier.emphasis,
	modifier.strike,
	inline.text,
];

export interface Context {
	cursor: {
		/** current index in the source */
		index: number;
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
	};

	is: {
		'left-flanking'(delimiter: number): boolean;
		'right-flanking'(delimiter: number): boolean;

		alphanumeric(char: string): boolean;
		punctuation(char: string): boolean;
		whitespace(char: string): boolean;
	};

	stack: {
		push<T extends Token>(token: T): T;
		pop(): Token | undefined;
		find<T extends Token['type']>(
			type: T,
			predicate?: (token: Extract<Token, { type: T }>) => boolean,
		): Extract<Token, { type: T }> | undefined;
		remove(token: Token): Token | undefined;
		peek(): Token | undefined;
	};

	compose: typeof compose;
	annotate: typeof annotate;
}

function contextualize(source: string, stack: Token[]): Context {
	let pointer = 0;

	const cursor: Context['cursor'] = {
		get index() {
			return pointer;
		},
		set index(value) {
			pointer = value;
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

	const is: Context['is'] = {
		'left-flanking'(n) {
			const before = cursor.see(-1);
			const after = cursor.see(n);
			return (
				!is.whitespace(after) &&
				(!is.punctuation(after) || is.whitespace(before) || is.punctuation(before))
			);
		},
		'right-flanking'(n) {
			const before = cursor.see(-n);
			const after = cursor.see(1);
			return (
				!is.whitespace(before) &&
				(!is.punctuation(before) || is.whitespace(after) || is.punctuation(after))
			);
		},

		alphanumeric(char) {
			return /\p{L}|\p{N}|_/u.test(char);
		},
		punctuation(char) {
			return /\p{P}|\p{S}/u.test(char);
		},
		whitespace(char) {
			return /\p{Zs}/u.test(char) || /\s/.test(char);
		},
	};

	return {
		cursor,
		is,
		stack: {
			peek() {
				return stack[stack.length - 1];
			},
			push(token) {
				stack.push(token);
				return token;
			},
			pop() {
				return stack.pop();
			},
			find(type, predicate = () => true) {
				return stack.find((token): token is any => token.type === type && predicate(token as any));
			},
			remove(token) {
				const index = stack.indexOf(token);
				if (index === -1) return undefined;
				return stack.splice(index, 1)[0];
			},
		},

		compose,
		annotate,
	};
}

/** create the root document from the source */
export function compose(source: string): {
	type: ':document';
	children: Token[];
} {
	const root = { type: ':document' as const, children: [] as Token[] };
	const input = source.trim();
	const tree = root.children;
	const stack: Token[] = [];

	let index = 0;
	while (index < input.length) {
		const context = contextualize(input.slice(index), stack);
		if (context.cursor.eat('\n')) {
			let current: Token | undefined = stack[stack.length - 1];
			while (current?.type === 'parent:paragraph' || current?.type === 'parent:quote') {
				current = stack.pop();
			}
		}

		const start = input[index + context.cursor.index];
		const rules = [...(dispatch.get(start) || []), parent.paragraph];
		const token = match({ ...context, rules });
		if (token && token !== tree[tree.length - 1]) tree.push(token);
		index += context.cursor.index;
	}

	for (const parent of tree) {
		if (
			!parent.type.startsWith('parent:') ||
			!('children' in parent) ||
			!('text' in parent) ||
			!parent.text
		)
			continue;

		index = stack.length = 0;
		parent.children = annotate(parent.text);
		// @ts-expect-error - why does it need to be optional?
		delete parent.text; // cleanup text after inline parsing
	}

	return root;
}

/** construct inline tokens from the source */
export function annotate(source: string): Token[] {
	const tree: Token[] = [];
	const stack: Token[] = [];

	let index = 0;
	while (index < source.length) {
		if (tree[tree.length - 1] !== stack[stack.length - 1]) stack.pop();
		const context = contextualize(source, stack);
		context.cursor.index = index;
		const token = match({ ...context, rules: tidbits });
		if (token && token !== tree[tree.length - 1]) tree.push(token);
		index = context.cursor.index;
	}
	return tree;
}

interface MatchContext extends Context {
	rules: Registry[];
}
function match({ rules, ...context }: MatchContext) {
	const start = context.cursor.index;
	for (const rule of rules) {
		const token = rule(context);
		if (token) return token;
		context.cursor.index = start;
	}
	return null;
}
