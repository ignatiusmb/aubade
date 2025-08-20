import type { Context } from './context.js';

export type Registry = [
	// aubade registries
	typeof comment,
	typeof markup,

	// block registries
	typeof codeblock,
	typeof divider,
	typeof heading,
	typeof list,
	typeof quote,
	() => { type: 'block:paragraph'; children: Annotation[]; text?: string },

	// inline registries
	typeof escape,
	typeof linebreak,
	typeof autolink,
	typeof codespan,
	typeof image,
	typeof link,
	() => { type: 'inline:strong'; children: Annotation[] },
	() => { type: 'inline:emphasis'; children: Annotation[] },
	() => { type: 'inline:strike'; children: Annotation[] },
	() => { type: 'inline:text'; text: string },
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

export function delimiter({ cursor, is }: Context): null | {
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
	const intra = is.alphanumeric(before) && is.alphanumeric(after);
	const left = is['left-flanking'](before, after);
	const right = is['right-flanking'](before, after);
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
	tag: string;
	attr: Record<string, string>;
	children: Block[];
} {
	if (!cursor.eat('<')) return null;

	const tag = cursor.locate(/\s|>/);
	if (!tag.length) return null;

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
	return { type: 'aubade:html', tag, attr, children };

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

// --- block registries ---

export function codeblock({ cursor }: Context): null | {
	type: 'block:code';
	meta: { info: string[] };
	attr: { 'data-language': string };
	children: { type: 'inline:code'; text: string }[];
} {
	let backticks = +cursor.eat('`');
	if (backticks === 0) return null;
	while (cursor.eat('`')) backticks++;
	if (backticks < 3) return null;

	const info = cursor.locate(/\n/).trim();
	if (/`/.test(info) || !cursor.eat('\n')) return null;
	const source = cursor.locate(/\r?\n\s*```|$/).trim();
	if (!source.length) return null;
	cursor.trim(), cursor.eat('```');

	const [language, ...rest] = info.split(/\s+/);

	return {
		type: 'block:code',
		meta: { info: rest },
		attr: { 'data-language': language },
		children: source.split('\n').map((line) => ({
			type: 'inline:code',
			text: line,
		})),
	};
}

export function divider({ cursor }: Context): null | {
	type: 'block:break';
} {
	const source = cursor.locate(/\n|$/).trim();
	if (!['---', '***', '___'].includes(source)) return null;
	return { type: 'block:break' };
}

export function heading({ annotate, extract, cursor, stack }: Context): null | {
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

	const heading = { type: 'block:heading' as const, meta: { level }, attr, children };
	return stack['block:heading'].push(heading), heading;
}

export function list({ compose, cursor }: Context): null | {
	type: 'block:list';
	ordered: boolean;
	children: Block[];
} {
	const match = cursor.peek(/^[ \t]{0,1}([-+*]|\d+[.)])\s+/);
	if (!match) return null;
	// const ordered = /^\d/.test(match[1]);
	// @TODO: implement
	compose; // recursive call to parse the list items
	return null;
}

export function quote({ compose, cursor }: Context): null | {
	type: 'block:quote';
	children: Block[];
} {
	if (cursor.see(0) !== '>') return null;
	const block = cursor.locate(/\n(?!>)|$/).trim();
	const body = block.split('\n').map((l) => l.slice(1).trim());
	const { children } = compose(body.join('\n'));
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
		cursor.eat('>'); // eat closing `>`
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
	const check = [
		code.length > 2,
		code[0] === ' ' && code.endsWith(' '),
		/[` ]/.test(code.slice(1, -1)),
	];
	if (check.every(Boolean)) code = code.slice(1, -1);
	return { type: 'inline:code', text: code };
}

export function escape({ cursor }: Context): null | {
	type: 'inline:escape';
	text: string;
} {
	if (!cursor.eat('\\')) return null;
	let next = cursor.read(1);
	if (!/[\\`*{}\[\]()#+\-!.<>:"'?=|~^&$%,@;]/.test(next)) {
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
	cursor.trim(); // eat whitespace between opening `(` and link

	const src = cursor.locate(/\s|\)/);
	cursor.trim(); // eat whitespace between link and optionally title

	const title = (cursor.eat('"') && cursor.locate(/"/)) || '';
	cursor.eat('"'), cursor.trim(); // eat the closing quote and whitespace

	// includes backticks that invalidates "](" pattern
	const invalid = alt.includes('`') && src.includes('`');
	if (invalid || !cursor.eat(')')) return null; // closing `)` is required

	return {
		type: 'inline:image',
		attr: { src, alt, title: title.trim() },
	};
}

export function linebreak({ cursor }: Context): null | {
	type: 'inline:break';
} {
	if (cursor.eat('\\\n') || cursor.eat('\n')) {
		return { type: 'inline:break' };
	}
	return null;
}

export function link({ annotate, extract, cursor }: Context): null | {
	type: 'inline:link';
	attr: { href: string; title: string };
	children: Annotation[];
} {
	if (!cursor.eat('[')) return null;
	const name = cursor.locate(/]/).replace(/\n/g, ' ');
	if (!cursor.eat('](')) return null;
	cursor.trim(); // eat whitespace between opening `(` and link

	const href = cursor.locate(/\s|\)/);
	cursor.trim(); // eat whitespace between link and optionally title

	const title = (cursor.eat('"') && cursor.locate(/"/)) || '';
	cursor.eat('"'), cursor.trim(); // eat closing quote and whitespace

	// includes backticks that invalidates "](" pattern
	const invalid = name.includes('`') && href.includes('`');
	if (invalid || !cursor.eat(')')) return null; // closing `)` is required

	return {
		type: 'inline:link',
		attr: {
			href: annotate(href).map(extract).join(''),
			title: annotate(title.trim()).map(extract).join(''),
		},
		children: annotate(name),
	};
}
