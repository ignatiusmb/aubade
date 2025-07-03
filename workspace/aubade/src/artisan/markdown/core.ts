import type { Block, Token } from './types.js';

interface Context {
	/** input source */
	source: string;
	/** AST tokens */
	tree: Token[];
	/** opened block stack */
	stack: Token[];

	eat(input: string): boolean;
	read(chars: number): string;
	/** eat until `pattern` is found */
	locate(pattern: RegExp): string;

	/** see `pattern` ahead */
	peek(pattern: RegExp): string;

	trim(): void;
}

export const registry = {
	// block
	':comment'({ tree, stack, eat, locate }) {
		if (!eat('<!--')) return null;
		const comment = locate(/-->/);
		if (!comment.length) return null;
		eat('-->');

		tree.push({
			type: ':comment',
			text: comment,
			meta: { source: '.text' },
		});
		stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'parent:html'({ tree, eat, read, locate }) {
		const open = read(1);
		if (open !== '<') return null;

		const tag = locate(/\s|>/);
		if (!tag.length) return null;
		eat('>');

		// TODO: handle elements without closing tags

		const html = locate(new RegExp(`</${tag}>`));
		if (!html.length) return null;
		eat(`</${tag}>`);

		tree.push({
			type: 'parent:html',
			text: html,
			attr: {},
			meta: { source: `<${tag}>${html}</${tag}>` },
			children: [],
		});
		return tree[tree.length - 1];
	},

	'block:break'({ source, tree }) {
		if (!['---', '***', '___'].includes(source)) return null;

		tree.push({
			type: 'block:break',
			meta: { source },
		});

		return tree[tree.length - 1];
	},

	'parent:heading'({ source, tree, stack }) {
		const match = source.match(/^(#{1,6})\s/);
		if (!match) return null;
		const { length: level } = match[1];
		const title = source.slice(level + 1).trim();

		const sibling = stack.findIndex(
			(token) => token.type === 'parent:heading' && token.meta.level === level,
		);
		if (sibling !== -1) stack.splice(sibling, 1);

		const parent = stack.find(
			(token): token is Block => token.type === 'parent:heading' && token.meta.level === level - 1,
		);
		const id = `${parent?.attr.id || ''}-${title.toLowerCase()}`
			.replace(/[\s\][!"#$%&'()*+,./:;<=>?@\\^_`{|}~-]+/g, '-')
			.replace(/^-+|-+$|(?<=-)-+/g, '');

		tree.push({
			type: 'parent:heading',
			text: title.trim(),
			attr: { id },
			meta: { source: '', level },
			children: [],
		});
		stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'parent:quote'({ source, tree, stack }) {
		const last = tree[tree.length - 1];
		const child = {
			type: 'parent:paragraph',
			text: source.slice(1).trim(),
			attr: {},
			meta: { source },
			children: [],
		} satisfies Token;

		if (last?.type === 'parent:quote') {
			last.children.push(child);
			return last;
		}

		tree.push({
			type: 'parent:quote',
			attr: {},
			meta: { source },
			children: [child],
		});
		stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'block:list'({ read }) {
		const char = read(1);
		const bullet = char === '-' || char === '*';
		const number = /^\d/.test(char);
		if (!bullet && !number) return null;
		// @TODO: implement
		return null;
	},

	'block:code'({ source, tree, stack }) {
		if (!source.startsWith('```')) return null;
		if (stack[stack.length - 1]?.type === 'block:code') {
			return stack.pop() as Token;
		}

		tree.push({
			type: 'block:code',
			text: '',
			attr: { 'data-language': source.slice(3).trim() },
			meta: { source },
			children: [],
		});
		stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	// inject opening paragraph before inline tokens
	'parent:paragraph'({ source, tree }) {
		const text = source[0] === '\\' ? source.slice(1) : source;
		const last = tree[tree.length - 1];
		if (last?.type === 'parent:paragraph') {
			last.text += '\n' + text;
			return last;
		}

		if (last?.type === 'block:code') {
			last.text = last.text ? last.text + '\n' + text : text;
			last.children.push({
				type: 'inline:code',
				text: text,
				meta: { source },
			});
			return last;
		}

		tree.push({
			type: 'parent:paragraph',
			text: text,
			attr: {},
			meta: { source },
			children: [],
		});

		return tree[tree.length - 1];
	},

	// only parse http[s]:// links for safety
	'inline:autolink'({ tree, eat, locate }) {
		const token: Token = {
			type: 'inline:autolink',
			text: '',
			attr: { href: '' },
			meta: { source: '' },
		};

		if (eat('<')) {
			token.text = locate(/(?=>)/);
			if (!token.text || /\s/.test(token.text)) return null;
			token.meta.source = `<${token.text}>`;
			eat('>'); // eat closing `>`
		} else {
			token.text = locate(/\s|$/);
			token.meta.source = token.text;
		}

		if (/^https?:\/\//.test(token.text)) {
			token.attr.href = token.text;
		} else if (/^mailto:/.test(token.text)) {
			token.attr.href = token.text;
		} else if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(token.text)) {
			token.attr.href = `mailto:${token.text}`;
		} else {
			return null;
		}

		return tree.push(token), token;
	},

	// code span backticks have higher precedence than any other inline constructs
	// except HTML tags and auto-links. https://spec.commonmark.org/0.31.2/#code-spans
	'inline:code'({ source, tree, eat, read }) {
		if (!eat('`')) return null;

		let n = 1; // delimiter
		while (eat('`')) n++;

		let code = '';
		let char = '';
		while (!eat('`'.repeat(n)) && (char = read(1))) {
			code += char;
		}
		if (!char) return null;

		tree.push({
			type: 'inline:code',
			text: code,
			meta: { source },
		});
		return tree[tree.length - 1];
	},

	'inline:image'({ tree, eat, locate, trim }) {
		if (!eat('![')) return null;
		const alt = locate(/]/);
		if (!eat('](')) return null;
		trim(); // eat whitespace between opening `(` and link

		const src = locate(/\s|\)/);
		trim(); // eat whitespace between link and optionally title

		const title = (eat('"') && locate(/"/)) || '';
		eat('"'), trim(); // eat the closing quote and whitespace

		// includes backticks that invalidates "](" pattern
		const invalid = alt.includes('`') && src.includes('`');
		if (invalid || !eat(')')) return null; // closing `)` is required

		tree.push({
			type: 'inline:image',
			text: alt,
			attr: { src, alt, title: title.trim() },
			meta: { source: `![${alt}](${src}${title ? ` "${title}"` : ''})` },
		});
		return tree[tree.length - 1];
	},

	'inline:link'({ tree, eat, locate, trim }) {
		if (!eat('[')) return null;
		const name = locate(/]/);
		if (!eat('](')) return null;
		trim(); // eat whitespace between opening `(` and link

		const href = locate(/\s|\)/);
		trim(); // eat whitespace between link and optionally title

		const title = (eat('"') && locate(/"/)) || '';
		trim(); // eat whitespace between optionally title and closing `)`

		// includes backticks that invalidates "](" pattern
		const invalid = name.includes('`') && href.includes('`');
		if (invalid || !eat(')')) return null; // closing `)` is required

		tree.push({
			type: 'inline:link',
			text: name,
			attr: { href, title: title.trim() },
			meta: { source: `[${name}](${href}${title ? ` "${title}"` : ''})` },
		});
		return tree[tree.length - 1];
	},

	'inline:strong'({ tree, stack, eat }) {
		if (!eat('**')) return null;
		if (stack.find((t) => t.type === 'inline:emphasis')) return null;

		const opened = stack.findIndex((t) => t.type === 'inline:strong');
		if (opened !== -1) {
			const inline = tree[tree.length - 1];
			const token = tree.indexOf(stack[opened]);
			if (inline.type === 'inline:text') {
				tree[token].text = inline.text;
				tree.splice(tree.length - 1, 1);
				return stack.splice(opened, 1)[0];
			}
			if ('children' in tree[token]) {
				tree[token].children.push(inline);
				tree.splice(tree.length - 1, 1);
				return stack.splice(opened, 1)[0];
			}
			return null; // last token is block
		}

		tree.push({
			type: 'inline:strong',
			text: '',
			attr: {},
			meta: { source: '**' },
			children: [],
		});
		stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'inline:emphasis'({ tree, stack, read }) {
		// double asterisk handled by `inline:strong`
		const char = read(1);
		if (char !== '*' && char !== '_') return null;

		const opened = stack.findIndex((t) => t.type === 'inline:emphasis');
		if (opened !== -1) {
			const inline = tree[tree.length - 1];
			if (inline.type !== 'inline:text') return null;
			const token = tree.indexOf(stack[opened]);
			tree[token].text = inline.text;
			tree.splice(tree.length - 1, 1);
			return stack.splice(opened, 1)[0];
		}

		tree.push({
			type: 'inline:emphasis',
			text: '',
			attr: {},
			meta: { source: char },
			children: [],
		});
		opened !== -1 ? stack.splice(opened, 1) : stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'inline:strike'({ tree, stack, eat }) {
		if (!eat('~~')) return null;

		const opened = stack.findIndex((t) => t.type === 'inline:strike');
		if (opened !== -1) {
			const inline = tree[tree.length - 1];
			if (inline.type !== 'inline:text') return null;
			const token = tree.indexOf(stack[opened]);
			tree[token].text = inline.text;
			tree.splice(tree.length - 1, 1);
			return stack.splice(opened, 1)[0];
		}

		tree.push({
			type: 'inline:strike',
			text: '',
			attr: {},
			meta: { source: '~~' },
			children: [],
		});
		opened !== -1 ? stack.splice(opened, 1) : stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'inline:text'({ tree, read }) {
		const char = read(1);

		const last = tree[tree.length - 1];
		if (last?.type === 'inline:text') {
			last.text += char;
			return last;
		}

		tree.push({ type: 'inline:text', text: char, meta: { source: char } });
		return tree[tree.length - 1];
	},
} satisfies Record<Exclude<Token['type'], ':document'>, Tokenizer>;

export type Tokenizer = (context: Context) => null | Token;
export const dispatch = new Map<string, Tokenizer[]>([
	['<', [registry['parent:html']]],
	['`', [registry['block:code']]],
	['#', [registry['parent:heading']]],
	['>', [registry['parent:quote']]],
	['-', [registry['block:break'], registry['block:list']]],
	['*', [registry['block:break'], registry['block:list']]],
	['_', [registry['block:break']]],
	['\\', [registry['parent:paragraph']]],
	[
		'inline',
		[
			registry['inline:code'],
			registry['inline:autolink'],
			registry['inline:image'],
			registry['inline:link'],
			registry['inline:strong'],
			registry['inline:emphasis'],
			registry['inline:strike'],
			registry['inline:text'],
		],
	],
]);

// add paragraph tokenizer as fallback for dispatchers
dispatch.forEach(
	(tokenizers, key) => key.length === 1 && tokenizers.push(registry['parent:paragraph']),
);
