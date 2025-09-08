import type { Context } from './context.js';

export type Registry = [
	// aubade registries
	typeof comment,
	typeof markup,
	typeof youtube,

	// extensions
	typeof figure,

	// block registries
	typeof divider,
	typeof heading,
	typeof codeblock,
	typeof quote,
	typeof list,
	() => { type: 'block:item'; children: Block[] },
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
			quoted = char === quoted ? null : char === '"' || char === "'" ? char : quoted;
			escaped = equals && !escaped && char === '\\';

			if (!quoted && name && char === ' ') {
				attr[clean(name)] = unquote(value);
				name = value = '';
				equals = false;
			} else if (char === '=') {
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

export function youtube({ cursor, annotate }: Context): null | {
	type: 'aubade:youtube';
	meta: { id: string; caption: Token[] };
} {
	if (!cursor.eat('@youtube[')) return null;
	let depth = 0;
	let title = '';
	let char = cursor.read(1);
	while (char) {
		if (char === ']') {
			if (depth === 0) break;
			depth -= 1;
		}
		if (char === '[') {
			depth += 1;
		}
		title += char;
		char = cursor.read(1);
	}
	cursor.eat('(');
	const id = cursor.locate(/\)/);
	if (!id.length || !cursor.eat(')')) return null;

	return { type: 'aubade:youtube', meta: { id, caption: annotate(title) } };

	// 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24 27 14v20" fill="white"/></svg>'
}

// --- block registries ---

export function codeblock({ cursor }: Context): null | {
	type: 'block:code';
	meta: { code: string; info: string };
	attr: { 'data-language': string };
} {
	cursor.trim();
	let backticks = +cursor.eat('`');
	if (backticks === 0) return null;
	while (cursor.eat('`')) backticks++;
	if (backticks < 3) return null;

	const info = cursor.locate(/\n/).trim();
	if (/`/.test(info)) return null;
	if (!cursor.eat('\n') && cursor.peek(/$/)) return null;

	let code = '';
	let line = cursor.peek(/\n|$/).trim();
	while (/[^`]/.test(line) || line.length < backticks) {
		code += cursor.locate(/\n|$/);
		if (!cursor.eat('\n')) break;
		code += '\n';
		line = cursor.peek(/\n|$/).trim();
	}
	cursor.trim();
	while (cursor.eat('`'));
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
	meta: { level: number };
	attr: { id: string; 'data-text': string };
	children: Annotation[];
} {
	cursor.trim(); // trim leading whitespace
	const match = cursor.locate(/\s/);
	if (!/^#{1,6}$/.test(match)) return null;
	const { length: level } = match;
	const title = cursor.locate(/\n|$/).trim();
	if (!title.length) return null;

	const children = annotate(title);
	const attr = {
		id: title
			.toLowerCase()
			.replace(/[\s\][!"#$%&'()*+,./:;<=>?@\\^_`{|}~-]+/g, '-')
			.replace(/^-+|-+$|(?<=-)-+/g, ''),
		'data-text': children.map(extract).join(''),
	};

	for (let i = stack['block:heading'].length - 1; i >= 0; i--) {
		const { attr: parent, meta } = stack['block:heading'][i];
		if (meta.level >= level) continue;
		attr.id = `${parent.id}-${attr.id}`;
		break;
	}

	let suffix = 0;
	for (const h of stack['block:heading']) {
		const check = suffix ? `${attr.id}-${suffix}` : attr.id;
		if (h.attr.id === check) suffix++;
	}
	attr.id = suffix ? `${attr.id}-${suffix}` : attr.id;

	return util.commit(stack['block:heading'], {
		type: 'block:heading',
		meta: { level },
		attr,
		children,
	});
}

export function list({ compose, cursor, stack, util }: Context): null | {
	type: 'block:list';
	meta: { marker: string; ordered: false | number };
	children: { type: 'block:item'; children: Block[] }[];
} {
	const head = normalize(cursor.peek(/\n|$/));
	const [marker] = head.trim().split(/[ \t]/, 1);
	if (!/^([-+*]|\d{1,9}[.)])$/.test(marker)) return null;

	const pos = head.trim().slice(marker.length).search(/\S/);
	if (pos === -1) {
		if (stack['block:paragraph'].length) return null;
		if (head.trim().length > marker.length) return null;
	}

	const indent = whitespace(head) + marker.length + pos;
	const item = [cursor.locate(/\n|$/).slice(indent)];
	while (cursor.eat('\n')) {
		const line = normalize(cursor.peek(/\n|$/));
		const inside = whitespace(line);
		if (inside < indent && line.trim()) break;
		item.push(normalize(cursor.locate(/\n|$/)).slice(indent));
	}

	const ordered = /\d+[.)]/.test(marker) && Number(marker.slice(0, -1));
	const list = util.last(stack['block:list']) || {
		type: 'block:list',
		meta: { marker, ordered },
		children: [],
	};

	const { children } = compose(item.join('\n'));
	list.children.push({ type: 'block:item', children });
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

// only parse http[s]:// and mails for safety
export function autolink({ cursor }: Context): null | {
	type: 'inline:autolink';
	attr: { href: string };
	text: string;
} {
	let text = '';

	if (cursor.eat('<')) {
		text = cursor.locate(/(?=>)/);
		if (!text || /\s/.test(text)) return null;
		cursor.eat('>');
	} else {
		text = cursor.locate(/\s|$/);
	}

	let href = '';
	if (/^https?:\/\//.test(text)) {
		href = encodeURI(text);
	} else if (/^mailto:/.test(text)) {
		href = text;
	} else if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(text)) {
		href = `mailto:${text}`;
	} else {
		return null;
	}

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
	if (!cursor.eat('![')) return null;
	const alt = cursor.locate(/]/);
	if (!cursor.eat('](')) return null;
	cursor.trim(); // whitespace between opening `(` and link

	const src = cursor.locate(/\s|\)/);
	cursor.trim(); // whitespace between link and optional title

	const title = (cursor.eat('"') && cursor.locate(/"/)) || '';
	cursor.eat('"');
	cursor.trim();

	// codespan backticks that invalidates "](" pattern
	const invalid = alt.includes('`') && src.includes('`');
	if (invalid || !cursor.eat(')')) return null;

	return {
		type: 'inline:image',
		attr: { src, alt, title: title.trim() },
	};
}

export function link({ annotate, extract, cursor }: Context): null | {
	type: 'inline:link';
	attr: { href: string; title: string };
	children: Annotation[];
} {
	if (!cursor.eat('[')) return null;
	const name = cursor.locate(/]/).replace(/\n/g, ' ');
	if (!cursor.eat('](')) return null;
	cursor.trim(); // whitespace between opening `(` and link

	let dest = '';
	if (cursor.eat('<')) {
		while (!cursor.eat('>')) {
			cursor.eat('\\');
			const char = cursor.read(1);
			if (!char || char === '\n') return null;
			dest += char === ' ' ? '%20' : char;
		}
	} else {
		// while (!cursor.eat(' ')) {
		// 	cursor.eat('\\');
		// 	const char = cursor.read(1);
		// 	dest += char;
		// }
		dest = cursor.locate(/\s|\)/);
	}
	cursor.trim(); // whitespace between link and optional title

	const title = (cursor.eat('"') && cursor.locate(/"/)) || '';
	cursor.eat('"');
	cursor.trim();

	// codespan backticks that invalidates "](" pattern
	const invalid = name.includes('`') && dest.includes('`');
	if (invalid || !cursor.eat(')')) return null;

	return {
		type: 'inline:link',
		attr: {
			href: annotate(dest).map(extract).join(''),
			title: annotate(title.trim()).map(extract).join(''),
		},
		children: annotate(name),
	};
}
