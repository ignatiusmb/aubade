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
	() => { type: 'block:paragraph'; children: Token[]; text?: string },

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
export type Dispatch = { [T in Token as T['type']]: T };

const dispatch = new Map([
	['<', [registry.comment, registry.markup]],
	['`', [registry.codeblock]],
	['#', [registry.heading]],
	['>', [registry.quote]],
	['-', [registry.divider, registry.list]],
	['*', [registry.divider, registry.list]],
	['_', [registry.divider]],
] as ReadonlyArray<readonly [string, Registry[]]>);

export interface Context {
	cursor: {
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
	};

	is: {
		'left-flanking'(before: string, after: string): boolean;
		'right-flanking'(before: string, after: string): boolean;

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

const is: Context['is'] = {
	'left-flanking'(before, after) {
		return (
			!is.whitespace(after) &&
			(!is.punctuation(after) || is.whitespace(before) || is.punctuation(before))
		);
	},
	'right-flanking'(before, after) {
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

function contextualize(source: string, stack: Token[]): Context {
	let pointer = 0;

	const cursor: Context['cursor'] = {
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
			while (current?.type === 'block:paragraph' || current?.type === 'block:quote') {
				current = stack.pop();
			}
		}

		const start = input[index + context.cursor.index];
		const known = (start === '\\' && []) || dispatch.get(start);
		const token = match({ ...context, rules: known || [registry.divider, registry.heading] });
		if (token) {
			if (token !== tree[tree.length - 1]) tree.push(token);
		} else {
			const text = context.cursor.locate(/\n|$/).trim();
			context.cursor.eat('\n'); // eat the line feed

			const last = stack[stack.length - 1];
			if (last?.type === 'block:paragraph') last.text += '\n' + text;
			else {
				tree.push({ type: 'block:paragraph', children: [], text });
				stack.push(tree[tree.length - 1]);
			}
		}
		index += context.cursor.index;
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
export function annotate(source: string): Token[] {
	const tree: Token[] = [];
	const stack: Token[] = [];

	let index = 0;
	while (index < source.length) {
		if (tree[tree.length - 1] !== stack[stack.length - 1]) stack.pop();
		const context = contextualize(source, stack);
		context.cursor.index = index;
		const token = match({
			...context,
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
			const char = context.cursor.read(1);
			const last = tree[tree.length - 1];
			if (last?.type === 'inline:text') last.text += char;
			else tree.push({ type: 'inline:text', text: char });
		}
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
