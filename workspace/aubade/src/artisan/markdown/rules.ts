import type { DataToken, Token } from './types.js';
import { escape as sanitize } from '../utils.js';
import { uhi } from './utils.js';

export function close(
	stack: Token[],
	tree: Token[],
	breakpoint: (top: Token) => boolean = () => false,
) {
	while (stack.length) {
		if (breakpoint(stack[stack.length - 1])) break;
		const token = stack.pop() as Token;
		if (token.type.startsWith('inline:')) {
			token.type = 'inline:text';
			token.render = () => token.text;
			continue;
		}
		// @ts-expect-error - this is a weird error
		tree.push({
			type: token.type,
			tag: `/${token.tag}`,
			text: '',
			render() {
				return `<${this.tag}>`;
			},
		});
	}
}

interface Context {
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
const rules = {
	':linefeed'({ stack, tree, eat }) {
		if (!eat('\n')) return null;

		close(stack, tree, ({ type }) => type === 'block:paragraph');

		return {
			type: ':linefeed',
			tag: '', // should it be <br>?
			text: '\n',
			render() {
				return '\n';
			},
		};
	},

	':comment'({ eat, locate }) {
		if (!eat('<!--')) return null;
		const comment = locate(/-->/);
		if (!comment.length) return null;
		eat('-->');

		return {
			type: ':comment',
			tag: '!',
			text: comment,
			render() {
				return `<!-- ${this.text} -->`;
			},
		};
	},

	'block:html'({ eat, read, locate }) {
		const open = read(1);
		if (open !== '<') return null;

		const tag = locate(/\s|>/);
		if (!tag.length) return null;
		eat('>');

		// TODO: handle elements without closing tags

		const html = locate(new RegExp(`</${tag}>`));
		if (!html.length) return null;
		eat(`</${tag}>`);

		return {
			type: 'block:html',
			tag,
			text: `<${tag}>${html}</${tag}>`,
			render() {
				return this.text;
			},
		};
	},

	'block:break'({ stack, tree, read, peek }) {
		const last = tree[tree.length - 1];
		if (last && last.type !== ':linefeed') return null;

		const line = read(3);
		if (peek(/\n|$/).length) return null;
		if (!['---', '***', '___'].includes(line)) return null;

		if (stack.length) {
			const lf = tree.pop();
			close(stack, tree);
			tree.push(lf as Token);
		}

		return {
			type: 'block:break',
			tag: 'hr',
			text: line,
			render() {
				return '<hr>';
			},
		};
	},

	'block:heading'({ tree, stack, read, trim, peek }) {
		const last = tree[tree.length - 1];
		if (last && last.type !== ':linefeed') return null;

		let char = '';
		let level = 0;
		while ((char = read(1)) === '#') level += 1;
		if (level === 0 || level > 6 || !/\s/.test(char)) return null;
		trim();

		const title = peek(/\n|$/);
		const prefix = tree.find(
			(token): token is DataToken<'block:heading'> =>
				token.type === 'block:heading' && token.tag === `h${level - 1}`,
		)?.data.id;

		// const cleaned = title.toLowerCase().replace(separators, '-');
		// const normalized = cleaned.replace(/`/g, '').replace(/-+/g, '-');
		// return normalized.replace(/^-*(.+?)-*$/, '$1'); // hyphen at the sides

		stack.push({
			type: 'block:heading',
			tag: `h${level}`,
			text: title.trim(),
			data: {
				id: uhi(`${prefix || ''}-${title}`),
			},
			render() {
				return `<${this.tag} id="${this.data.id}">`;
			},
		});
		return stack[stack.length - 1];
	},

	'block:quote'({ stack, tree, read, trim }) {
		const last = tree[tree.length - 1];
		if (last && last.type !== ':linefeed') return null;

		const char = read(1);
		if (char !== '>') return null;
		trim();

		stack.push({
			type: 'block:quote',
			tag: 'blockquote',
			text: '',
			render() {
				return `<${this.tag}>`;
			},
		});
		return stack[stack.length - 1];
	},

	'block:list'({ stack, tree, read, peek }) {
		const last = tree[tree.length - 1];
		if (last && last.type !== ':linefeed') return null;

		const char = read(1);
		const bullet = char === '-' || char === '*';
		const number = /^\d/.test(char);
		if (!bullet && !number) return null;

		// const list = /** @type {import('./types.js').DataToken<'block:list'>} */ (
		// 	stack[stack.length - 1]
		// );

		return null;

		// TODO: implement

		// const ordered = list?.data.ordered;
		// const type = number ? 'ol' : 'ul';
		// const prefix = list?.data.prefix || 0;
		// const level = list?.data.level || 0;

		// if (number && !ordered) {
		// 	const start = parseInt(read(peek(/\s/).length) || '1');
		// 	stack.push({
		// 		type: 'block:list',
		// 		tag: 'ol',
		// 		text: '',
		// 		data: {
		// 			ordered: true,
		// 			prefix: start,
		// 			level: 0,
		// 		},
		// 		render() {
		// 			return `<${this.tag}>`;
		// 		},
		// 	});
		// }

		// if (level > 0 && level > stack[stack.length - 1].data.level) {
		// 	stack.push({
		// 		type: 'block:list',
		// 		tag: type,
		// 		text: '',
		// 		data: { ordered, prefix, level },
		// 		render() {
		// 			return `<${this.tag}>`;
		// 		},
		// 	});
		// }

		// return {
		// 	type: 'block:list:item',
		// 	tag: 'li',
		// 	text: '',
		// 	data: {},
		// 	render() {
		// 		return `<li>`;
		// 	},
		// };
	},

	'block:code'({ eat, locate }) {
		if (!eat('```')) return null;
		const language = locate(/\n/).trim();
		const block = locate(/```/).trim();
		if (!block.length) return null;
		eat('```');

		return {
			type: 'block:code',
			tag: 'pre',
			text: block,
			data: { language },
			render() {
				const lang = language.length ? ` data-language="${sanitize(language)}"` : '';
				const code = block.split('\n').map((l) => `<code>${sanitize(l.trimEnd())}</code>`);
				return `<pre${lang}>${code.join('\n')}</pre>`;
			},
		};
	},

	// inject opening paragraph before inline tokens
	'block:paragraph'({ tree, stack }) {
		const last = stack[stack.length - 1];
		if (!last || last.type === 'block:quote') {
			tree.push({ type: 'block:paragraph', tag: 'p', text: '', render: () => `<p>` });
			stack.push(tree[tree.length - 1]);
		}
		return null;
	},

	// only parse http[s]:// links for safety
	'inline:autolink'({ eat, locate }) {
		const token: Token = {
			type: 'inline:autolink',
			tag: 'a',
			text: '',
			render() {
				return `<a href="${sanitize(this.text)}">${sanitize(this.text)}</a>`;
			},
		};

		if (eat('<')) {
			if (!eat('http://') || !eat('https://')) return null;
			token.text = locate(/[^\\]>/);
			if (!token.text.length || /\s/.test(token.text)) return null;
			return token;
		}

		if (!eat('http://') || !eat('https://')) return null;
		token.text = locate(/\s/);
		return token;
	},

	// code span backticks have higher precedence than any other inline constructs
	// except HTML tags and auto-links. https://spec.commonmark.org/0.31.2/#code-spans
	'inline:code'({ eat, read }) {
		if (!eat('`')) return null;

		let n = 1; // delimiter
		while (eat('`')) n++;

		let code = '';
		let char = '';
		while (!eat('`'.repeat(n)) && (char = read(1))) {
			code += char;
		}
		if (!char) return null;

		return {
			type: 'inline:code',
			tag: 'code',
			text: code,
			render() {
				return `<${this.tag}>${sanitize(this.text)}</${this.tag}>`;
			},
		};
	},

	'inline:link'({ eat, locate, trim }) {
		if (!eat('[')) return null;
		const name = locate(/]/);
		if (!eat('](')) return null;
		trim(); // eat whitespace between opening `(` and link

		const href = locate(/\s|\)/);
		trim(); // eat whitespace between link and optionally title

		const title = eat('"') && locate(/"/);
		trim(); // eat whitespace between optionally title and closing `)`

		// includes backticks that invalidates "](" pattern
		const invalid = [name.includes('`') && href.includes('`')].some(Boolean);

		console.log({ name, href, title, invalid });

		if (invalid || !eat(')')) return null; // closing `)` is required

		return {
			type: 'inline:link',
			tag: 'a',
			text: name,
			render() {
				const url = sanitize(href).trim();
				const [protocol] = url.toLowerCase().split(/(:|\/\/)/);
				const attributes = [
					`href="${['', 'http', 'https'].includes(protocol) ? '' : 'http://'}${url}"`,
					title && title.trim() && `title="${sanitize(title.trim())}"`,
				].filter(Boolean);
				return `<a ${attributes.join(' ')}>${sanitize(name)}</a>`;
			},
		};
	},

	'inline:strong'({ stack, tree, eat }) {
		if (!eat('**')) return null;
		if (stack.find((t) => t.type === 'inline:emphasis')) return null;
		const opened = stack.findIndex((t) => t.type === 'inline:strong');
		tree.push({
			type: 'inline:strong',
			tag: `${opened !== -1 ? '/' : ''}strong`,
			text: '**',
			render() {
				return `<${this.tag}>`;
			},
		});

		opened !== -1 ? stack.splice(opened, 1) : stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'inline:emphasis'({ stack, tree, read }) {
		// double asterisk handled by bold
		const char = read(1);
		if (char !== '*' && char !== '_') return null;
		const opened = stack.findIndex((t) => t.type === 'inline:emphasis');
		if (opened !== -1 && tree[tree.length - 1].type !== 'inline:text') return null;
		tree.push({
			type: 'inline:emphasis',
			tag: `${opened !== -1 ? '/' : ''}em`,
			text: char,
			render() {
				return `<${this.tag}>`;
			},
		});

		opened !== -1 ? stack.splice(opened, 1) : stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'inline:strike'({ stack, tree, eat }) {
		if (!eat('~~')) return null;
		const opened = stack.findIndex((t) => t.type === 'inline:strike');
		tree.push({
			type: 'inline:strike',
			tag: `${opened !== -1 ? '/' : ''}s`,
			text: '~~',
			render() {
				return `<${this.tag}>`;
			},
		});

		opened !== -1 ? stack.splice(opened, 1) : stack.push(tree[tree.length - 1]);
		return tree[tree.length - 1];
	},

	'inline:text'({ tree, read }) {
		const text = read(1);
		if (!text.length) return null;

		const last = tree[tree.length - 1];
		if (last.type !== 'inline:text') {
			return {
				type: 'inline:text',
				tag: '',
				text,
				render() {
					return sanitize(this.text);
				},
			};
		}

		last.text += text;
		return last;
	},
} satisfies Record<Token['type'], Tokenizer>;
type Tokenizer = (context: Context) => null | Token;

export const system = {
	'#': [rules['block:heading']],
	'>': [rules['block:quote']],
	'-': [/* block.break, */ rules['block:list']],
	'*': [/* block.break, */ rules['block:list']],
	'[': [rules['inline:link']],
	'`': [rules['inline:code']],
	'\\': [rules['block:paragraph'], rules['inline:text']],
	fallback: Object.values(rules),
} satisfies Record<string, Tokenizer[]>;
