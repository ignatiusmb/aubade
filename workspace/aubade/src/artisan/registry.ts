import type { Context } from './context.js';

export type Registry = [
	// libretto
	typeof directive,
	typeof comment,
	typeof markup,
	typeof table,
	typeof figure,

	// block registries
	typeof divider,
	typeof heading,
	typeof codeblock,
	typeof quote,
	typeof list,
	() => { type: 'block:item'; meta: { wrapped: boolean }; children: Token[] },
	() => { type: 'block:paragraph'; children: Annotation[]; text?: string },

	// inline registries
	typeof escape,
	typeof autolink,
	typeof codespan,
	typeof image,
	typeof link,
	() => { type: 'inline:strong'; children: Annotation[] },
	() => { type: 'inline:emphasis'; children: Annotation[] },
	() => { type: 'inline:strike'; children: Annotation[] },
	() => { type: 'inline:text'; text: string },
	() => { type: 'inline:break' },
][number];
export type Token = Registry extends (ctx: any) => infer R ? NonNullable<R> : never;
export type Annotation = Exclude<Token, { type: `block:${string}` }>;
export type Block = Exclude<Token, { type: `inline:${string}` }>;

// --- aubade registries ---

export function comment({ cursor }: Context): null | {
	type: 'aubade:comment';
	text: string;
} {
	if (!cursor.eat('<!--')) return null;
	const comment = cursor.locate(/-->/);
	if (!comment.length) return null;
	cursor.eat('-->');
	return { type: 'aubade:comment', text: comment.trim() };
}

export function delimiter({ cursor, util }: Context): null | {
	type: 'aubade:delimiter';
	text: string;
	meta: {
		char: '*' | '_' | '~';
		count: number;
		can: { open: boolean; close: boolean };
	};
} {
	let count = 1;
	const before = cursor.see(-1);
	const char = cursor.read(1) as '*' | '_' | '~';
	while (cursor.eat(char)) count++;
	const after = cursor.see(0);

	// underscore cannot be used for emphasis inside words
	// https://spec.commonmark.org/0.31.2/#example-360
	// https://spec.commonmark.org/0.31.2/#example-374
	const intra = util.is.alphanumeric(before) && util.is.alphanumeric(after);
	const left = util.is['left-flanking'](before, after);
	const right = util.is['right-flanking'](before, after);
	const can = {
		open: char === '_' ? !intra && left : left,
		close: char === '_' ? !intra && right : right,
	};
	return {
		type: 'aubade:delimiter',
		text: char.repeat(count),
		meta: { char, count, can },
	};
}

export function directive({ cursor }: Context): null | {
	type: 'aubade:directive';
	meta: { type: string; data: Record<string, string> };
} {
	cursor.trim();
	if (!cursor.eat('@')) return null;
	const type = cursor.locate(/{/);
	if (!type.length) return null;
	cursor.eat('{');

	const data: Record<string, string> = {};
	let char = cursor.read(1);
	if (char !== '}') {
		let [equals, escaped] = [false, false];
		let quoted: '"' | "'" | null = null;
		let [name, value] = ['', ''];
		while (char && char !== '}') {
			escaped = equals && !escaped && char === '\\';
			if (char === '"' || char === "'") {
				quoted = quoted === char ? null : quoted || char;
			}

			if (!quoted && name && char === ' ') {
				value = unquote(value.trim());
				data[clean(name)] = String(value === '' || value);
				name = value = '';
				equals = false;
			} else if (!quoted && char === '=') {
				equals = true;
			} else if (quoted || char !== ' ') {
				if (!equals) name += char;
				else value += char;
			}

			char = cursor.read(1);
		}
		if (name && value) {
			data[clean(name)] = unquote(value.trim());
		}
	}

	return { type: 'aubade:directive', meta: { type, data } };

	// --- internal helpers ---

	function clean(name: string): string {
		return name.replace(/[^a-zA-Z0-9_.:-]+/g, '_').replace(/^([^a-zA-Z_:])/, '_');
	}
	function unquote(text: string): string {
		if (text.length < 2) return text;
		const last = text[text.length - 1];
		if (text[0] !== '"' && text[0] !== "'") return text;
		return last === text[0] ? text.slice(1, -1) : text;
	}
}

export function markup({ compose, cursor }: Context): null | {
	type: 'aubade:html';
	meta: { tag: string };
	attr: Record<string, string>;
	children: Block[];
} {
	if (!cursor.eat('<')) return null;

	const tag = cursor.locate(/\s|>/);
	if (!/^[a-z][a-z0-9-]*$/i.test(tag)) return null;

	const attr: Record<string, string> = {};
	let char = cursor.read(1);
	if (char !== '>') {
		let [equals, escaped] = [false, false];
		let quoted: '"' | "'" | null = null;
		let [name, value] = ['', ''];
		while (char && char !== '>') {
			escaped = equals && !escaped && char === '\\';
			if (char === '"' || char === "'") {
				quoted = quoted === char ? null : quoted || char;
			}

			if (!quoted && name && char === ' ') {
				attr[clean(name)] = unquote(value);
				name = value = '';
				equals = false;
			} else if (!quoted && char === '=') {
				equals = true;
			} else if (quoted || char !== ' ') {
				if (!equals) name += char;
				else value += char;
			}

			char = cursor.read(1);
		}
		if (name && value) attr[clean(name)] = unquote(value);
	}

	const close = `</${tag}>`;
	const contents = cursor.locate(new RegExp(close));
	if (!contents.length && !cursor.eat(close)) return null;
	cursor.eat(close);

	const { children } = compose(contents);
	return { type: 'aubade:html', meta: { tag }, attr, children };

	// --- internal helpers ---

	function clean(name: string): string {
		return name.replace(/[^a-zA-Z0-9_.:-]+/g, '_').replace(/^([^a-zA-Z_:])/, '_');
	}
	function unquote(text: string): string {
		if (text.length < 2) return text;
		const last = text[text.length - 1];
		if (text[0] !== '"' && text[0] !== "'") return text;
		return last === text[0] ? text.slice(1, -1) : text;
	}
}

export function table({ cursor, annotate }: Context): null | {
	type: 'block:table';
	meta: {
		align: Array<'left' | 'center' | 'right'>;
		head?: Annotation[][];
		rows: Annotation[][][];
	};
} {
	let peek = cursor.peek(/\n|$/).trim();
	const pattern = /^\|.+\|$/;
	if (!pattern.test(peek)) return null;
	const lines = [cursor.locate(/\n|$/).trim()];
	while (cursor.eat('\n')) {
		const line = cursor.peek(/\n|$/).trim();
		if (!pattern.test(line)) break;
		lines.push(cursor.locate(/\n|$/).trim());
	}
	if (lines.length < 2) return null;

	const align = gauge(lines[0]) || gauge(lines[1]);
	if (align == null) return null;

	const header = !gauge(lines[0]) && segment(lines[0]);
	const head = header === false ? undefined : header;
	const rows = lines.slice(header ? 2 : 1).map(segment);
	return { type: 'block:table', meta: { align, head, rows } };

	function gauge(line: string): null | Array<'left' | 'center' | 'right'> {
		const alignment: Array<'left' | 'center' | 'right'> = [];
		const cells = line.split('|');
		for (let i = 1; i < cells.length - 1; i += 1) {
			const text = cells[i].trim();
			if (!/^:?-+:?$/.test(text)) return null;
			if (!text.endsWith(':')) alignment.push('left');
			else if (text[0] === ':') alignment.push('center');
			else alignment.push('right');
		}
		return alignment;
	}

	function segment(line: string): Annotation[][] {
		const cells: string[] = [];
		let escaped = false;
		for (let i = 1, last = i; i < line.length; ) {
			if (line[i] !== '|') {
				escaped = !escaped && line[i++] === '\\';
			} else if (escaped) {
				escaped = !++i;
			} else {
				const text = line.slice(last, i).trim();
				cells.push(text.replace(/\\\|/g, '|'));
				i += 2;
				last = i;
			}
		}
		return cells.map(annotate);
	}
}

// --- block registries ---

export function codeblock({ cursor }: Context): null | {
	type: 'block:code';
	meta: { code: string; info: string };
	attr: { 'data-language': string };
} {
	cursor.trim();
	const c = cursor.see(0);
	if (c !== '`' && c !== '~') return null;
	let backticks = +cursor.eat(c);
	if (backticks === 0) return null;
	while (cursor.eat(c)) backticks++;
	if (backticks < 3) return null;

	const info = cursor.locate(/\n/).trim();
	if (c === '`' && /`/.test(info)) return null;
	if (!cursor.eat('\n') && cursor.peek(/$/)) return null;

	let code = '';
	let line = cursor.peek(/\n|$/).trim();
	const check = new RegExp(`^${c}{${backticks},}$`);
	while (!check.test(line)) {
		code += cursor.locate(/\n|$/);
		if (!cursor.eat('\n')) break;
		code += '\n';
		line = cursor.peek(/\n|$/).trim();
	}
	cursor.trim();
	while (cursor.eat(c));
	cursor.trim();

	const separator = info.indexOf(' ');
	const language = separator === -1 ? info : info.slice(0, separator);
	const extra = separator === -1 ? '' : info.slice(separator).trim();
	return {
		type: 'block:code',
		meta: { code, info: extra },
		attr: { 'data-language': language },
	};
}

export function divider({ cursor }: Context): null | {
	type: 'block:break';
} {
	const source = cursor.locate(/\n|$/).replace(/\s/g, '');
	if (!/^([*_-])\1{2,}$/.test(source)) return null;
	return { type: 'block:break' };
}

export function figure(context: Context): null | {
	type: 'block:image';
	attr: { src: string; alt: string };
	children: Annotation[];
} {
	const token = image(context);
	if (!token) return null;
	const children = context.annotate(token.attr.title);
	return { type: 'block:image', attr: token.attr, children };
}

export function heading({ annotate, extract, cursor, stack, util }: Context): null | {
	type: 'block:heading';
	meta: { level: number; text: string };
	attr: { id: string };
	children: Annotation[];
} {
	cursor.trim(); // trim leading whitespace
	const match = cursor.locate(/\s/);
	if (!/^#{1,6}$/.test(match)) return null;
	const { length: level } = match;
	const title = cursor.locate(/\n|$/).trim();
	if (!title.length) return null;

	const children = annotate(title);
	let id = title
		.toLowerCase()
		.replace(/[\s\][!"#$%&'()*+,./:;<=>?@\\^_`{|}~-]+/g, '-')
		.replace(/^-+|-+$|(?<=-)-+/g, '');

	for (let i = stack['block:heading'].length - 1; i >= 0; i--) {
		const { attr: parent, meta } = stack['block:heading'][i];
		if (meta.level < level) {
			id = `${parent.id}-${id}`;
			break;
		}
	}

	let suffix = 0;
	for (const h of stack['block:heading']) {
		const check = suffix ? `${id}-${suffix}` : id;
		if (h.attr.id === check) suffix++;
	}

	return util.commit(stack['block:heading'], {
		type: 'block:heading',
		meta: { level, text: children.map(extract).join('') },
		attr: { id: suffix ? `${id}-${suffix}` : id },
		children,
	});
}

export function list({ compose, cursor, stack, util }: Context): null | {
	type: 'block:list';
	meta: { marker: string; ordered: false | number };
	children: Extract<Token, { type: 'block:item' }>[];
} {
	const head = normalize(cursor.peek(/\n|$/));
	const [marker] = head.trim().split(/[ \t]/, 1);
	if (!/^([-+*]|\d{1,9}[.)])$/.test(marker)) return null;

	const pos = head.trim().slice(marker.length).search(/\S/);
	if (pos === -1) {
		if (stack['block:paragraph'].length) return null;
		if (head.trim().length > marker.length) return null;
	}

	const base = whitespace(head) + marker.length + pos;
	const indent = Math.max(base, marker.length + 1);
	const item = [cursor.locate(/\n|$/).slice(indent)];
	while (cursor.eat('\n')) {
		const line = normalize(cursor.peek(/\n|$/));
		const inside = whitespace(line);
		if (inside < indent && line.trim()) break;
		if (item[0] === '' && !line.trim()) break;
		item.push(normalize(cursor.locate(/\n|$/)).slice(indent));
	}

	const ordered = /\d+[.)]/.test(marker) && Number(marker.slice(0, -1));
	const list = util.last(stack['block:list']) || {
		type: 'block:list',
		meta: { marker, ordered },
		children: [],
	};

	const { children: blocks } = compose(item.join('\n'));
	list.children.push({
		type: 'block:item',
		meta: { wrapped: item.includes('') && blocks.length > 1 },
		children: blocks,
	});
	return util.commit(stack['block:list'], list);

	function normalize(line: string): string {
		let i = 0;
		while (i < line.length && /\s/.test(line[i])) i++;
		return line.slice(0, i).replace(/\t/g, '    ') + line.slice(i);
	}

	function whitespace(line: string): number {
		let i = 0;
		let count = 0;
		while (i < line.length && /\s/.test(line[i])) {
			count += line[i++] === '\t' ? 4 : 1;
		}
		return count;
	}
}

export function quote({ compose, cursor }: Context): null | {
	type: 'block:quote';
	children: Block[];
} {
	let peek = cursor.peek(/\n|$/).trim();
	if (peek[0] !== '>') return null;
	const block: string[] = [];
	while (peek.startsWith('>')) {
		const line = cursor.locate(/\n|$/).trim();
		const start = line.startsWith('> ') ? 2 : 1;
		block.push(line.slice(start));
		if (!cursor.eat('\n')) break;
		peek = cursor.peek(/\n|$/).trim();
	}
	const { children } = compose(block.join('\n'));
	return { type: 'block:quote', children };
}

// --- inline registries ---

const SCHEME = /^[a-z][a-z0-9+.-]{1,31}:/i;
const EMAIL = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
export function autolink({ cursor }: Context): null | {
	type: 'inline:autolink';
	attr: { href: string };
	text: string;
} {
	if (!cursor.eat('<')) return null;
	const text = cursor.locate(/(?=>)/);
	if (!text || /\s/.test(text)) return null;
	cursor.eat('>');

	if (!(text.includes(':') ? SCHEME : EMAIL).test(text)) return null;
	const href = text.includes(':') ? encodeURI(text) : `mailto:${text}`;
	return { type: 'inline:autolink', attr: { href }, text };
}

// code span backticks have higher precedence than any other inline constructs
// except HTML tags and auto-links. https://spec.commonmark.org/0.31.2/#code-spans
export function codespan({ cursor }: Context): null | {
	type: 'inline:code';
	text: string;
} {
	const before = cursor.see(-1);
	let backticks = +cursor.eat('`');
	if (backticks === 0) return null;
	if (before === '`') return null;
	while (cursor.eat('`')) backticks++;

	let code = '';
	while (
		code.endsWith('`') ||
		cursor.see(backticks) === '`' ||
		!cursor.peek('`'.repeat(backticks))
	) {
		const char = cursor.read(1);
		if (!char) return null;
		code += char;
	}
	if (!cursor.eat('`'.repeat(backticks))) return null;
	code = code.replace(/\n/g, ' ');
	const trim = code.length > 2 && code[0] === ' ' && code.endsWith(' ');
	return { type: 'inline:code', text: trim ? code.slice(1, -1) : code };
}

export function escape({ cursor }: Context): null | {
	type: 'inline:escape';
	text: string;
} {
	if (!cursor.eat('\\')) return null;
	let next = cursor.read(1);
	if (!next || next === '\n') return null;
	if (!/[\/_\\`*{}\[\]()#+\-!.<>:"'?=|~^&$%,@;]/.test(next)) {
		next = '\\' + next; // escape character is not a valid inline token
	}

	return { type: 'inline:escape', text: next };
}

export function image({ cursor }: Context): null | {
	type: 'inline:image';
	attr: { src: string; alt: string; title: string };
} {
	if (!cursor.eat('!')) return null;
	const link = construct(cursor);
	if (!link) return null;

	return {
		type: 'inline:image',
		attr: {
			src: link.target,
			alt: link.label,
			title: link.title.trim(),
		},
	};
}

export function link({ annotate, extract, cursor }: Context): null | {
	type: 'inline:link';
	attr: { href: string; title: string };
	children: Annotation[];
} {
	const link = construct(cursor);
	if (!link) return null;

	const children = annotate(link.label.replace(/\n/g, ' '));
	if (trace(children)) return null;

	const dest = annotate(link.target).map(extract).join('');
	const title = annotate(link.title.trim()).map(extract).join('');
	return {
		type: 'inline:link',
		attr: { href: encodeURI(dest), title },
		children,
	};

	function trace(tokens: Token[]): boolean {
		for (const token of tokens) {
			if (token.type === 'inline:link') return true;
			if ('children' in token && trace(token.children)) return true;
		}
		return false;
	}
}

function construct(cursor: Context['cursor']): null | {
	label: string;
	target: string;
	title: string;
} {
	if (!cursor.eat('[')) return null;
	let balance = 1;
	let label = '';
	while (balance > 0) {
		const escaped = cursor.eat('\\');
		const char = cursor.read(1);
		if (!char) return null;
		if (!escaped) {
			balance += char === '[' ? 1 : char === ']' ? -1 : 0;
		}
		if (balance > 0) label += char;
	}
	if (!cursor.eat('(')) return null;

	cursor.trim();
	let target = '';
	for (;;) {
		const escaped = cursor.eat('\\');
		const char = cursor.read(1);
		if (!char) return null;
		if (target[0] !== '<' && / |\n/.test(char)) break;
		if (!escaped && target[0] !== '<') {
			balance += char === '(' ? 1 : char === ')' ? -1 : 0;
		}
		target += balance >= 0 ? char : '';
		if (balance < 0) break;
		if (target[0] === '<' && char === '>') {
			if (!escaped) target = target.slice(1, -1);
		}
	}

	let title = '';
	if (balance === 0) {
		cursor.trim();
		const c = cursor.see(0);
		if (c === '"' || c === "'") {
			cursor.eat(c);
			while (!cursor.eat(c)) {
				cursor.eat('\\');
				const char = cursor.read(1);
				if (!char || char === '\n') return null;
				title += char;
			}
		}
	}

	if (balance === 0) {
		while (cursor.eat(' '));
		if (!cursor.eat(')')) return null;
	}
	// codespan backticks that invalidates "](" pattern
	const invalid = label.includes('`') && target.includes('`');
	if (invalid || target.includes('\n')) return null;

	return { label, target, title };
}
