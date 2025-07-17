import type { Context, Token } from './engine.js';

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

export function markup({ cursor, compose }: Context): null | {
	type: 'aubade:html';
	text: string;
	attr: Record<string, string>;
	children: Token[];
} {
	const open = cursor.read(1);
	if (open !== '<') return null;

	const tag = cursor.locate(/\s|>/);
	if (!tag.length) return null;
	cursor.eat('>');

	// TODO: handle elements without closing tags
	compose; // recursive call to parse the inner HTML

	const html = cursor.locate(new RegExp(`</${tag}>`));
	if (!html.length) return null;
	cursor.eat(`</${tag}>`);

	return {
		type: 'aubade:html',
		text: html,
		attr: {},
		children: [],
	};
}

// --- block registries ---

export function codeblock({ cursor }: Context): null | {
	type: 'block:code';
	attr: { 'data-language': string };
	children: { type: 'inline:code'; text: string }[];
} {
	if (!cursor.eat('```')) return null;
	const language = cursor.locate(/\n/).trim();
	const source = cursor.locate(/\r?\n```|$/).trim();
	if (!source.length) return null;
	cursor.trim(), cursor.eat('```');

	return {
		type: 'block:code',
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

export function heading({ cursor, stack }: Context): null | {
	type: 'block:heading';
	text: string;
	attr: { id: string };
	meta: { level: number };
	children: Token[];
} {
	const match = cursor.locate(/\s/);
	if (!/^#{1,6}$/.test(match)) return null;
	const { length: level } = match;
	const title = cursor.locate(/\n|$/).trim();
	if (!title.length) return null;

	const sibling = stack.find('block:heading', (token) => token.meta.level === level);
	if (sibling) stack.remove(sibling);

	const parent = stack.find('block:heading', (token) => token.meta.level === level - 1);

	const id = `${parent?.attr.id || ''}-${title.toLowerCase()}`
		.replace(/[\s\][!"#$%&'()*+,./:;<=>?@\\^_`{|}~-]+/g, '-')
		.replace(/^-+|-+$|(?<=-)-+/g, '');

	return stack.push({
		type: 'block:heading',
		text: title,
		attr: { id },
		meta: { level },
		children: [],
	});
}

export function list({ cursor, compose }: Context): null | {
	type: 'block:list';
	children: [];
} {
	const char = cursor.read(1);
	const bullet = char === '-' || char === '*';
	const number = /^\d/.test(char);
	if (!bullet && !number) return null;
	// @TODO: implement
	compose; // recursive call to parse the list items
	return null;
}

export function paragraph({ cursor, stack }: Context): null | {
	type: 'block:paragraph';
	text: string;
	children: Token[];
} {
	const text = cursor.locate(/\n|$/).trim();
	cursor.eat('\n'); // eat the newline character

	const last = stack.peek();
	if (last?.type === 'block:paragraph') {
		last.text += '\n' + text;
		return last;
	}

	return stack.push({
		type: 'block:paragraph',
		text: text,
		children: [],
	});
}

export function quote({ cursor, stack, compose }: Context): null | {
	type: 'block:quote';
	children: Token[];
} {
	const match = cursor.eat('>');
	if (!match) return null;

	const body = cursor.locate(/\n|$/).trim();
	const { children } = compose(body);
	const last = stack.peek();
	if (last?.type === 'block:quote') {
		last.children.push(...children);
		return last;
	}

	return stack.push({ type: 'block:quote', children });
}

// --- inline registries ---

// only parse http[s]:// and mails for safety
export function autolink({ cursor }: Context): null | {
	type: 'inline:autolink';
	text: string;
	attr: { href: string };
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

	return { type: 'inline:autolink', text, attr: { href } };
}

// code span backticks have higher precedence than any other inline constructs
// except HTML tags and auto-links. https://spec.commonmark.org/0.31.2/#code-spans
export function codespan({ cursor }: Context): null | {
	type: 'inline:code';
	text: string;
} {
	if (!cursor.eat('`')) return null;

	let code = '';
	let char = '';
	const n = 1 + cursor.locate(/[^`]/).length;
	while (!cursor.eat('`'.repeat(n)) && (char = cursor.read(1))) {
		code += char;
	}
	if (!char) return null;
	if (code[0] === ' ' && code[0] === code[code.length - 1]) {
		code = code.slice(1, -1); // trim the single space
	}
	return { type: 'inline:code', text: code };
}

export function escape({ cursor, stack }: Context): null | {
	type: 'inline:text';
	text: string;
} {
	if (!cursor.eat('\\')) return null;
	let next = cursor.read(1);
	if (!/[\\`*{}\[\]()#+\-!.<>:"'?=|~^&$%,@;]/.test(next)) {
		next = '\\' + next; // escape character is not a valid inline token
	}

	const last = stack.peek();
	if (last?.type === 'inline:text') {
		last.text += next;
		return last;
	}
	return stack.push({ type: 'inline:text', text: next });
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

export function link({ cursor, annotate }: Context): null | {
	type: 'inline:link';
	attr: { href: string; title: string };
	children: Token[];
} {
	if (!cursor.eat('[')) return null;
	const name = cursor.locate(/]/).replace(/\n/g, ' ');
	if (!cursor.eat('](')) return null;
	cursor.trim(); // eat whitespace between opening `(` and link

	const href = cursor.locate(/\s|\)/);
	cursor.trim(); // eat whitespace between link and optionally title

	const title = (cursor.eat('"') && cursor.locate(/"/)) || '';
	cursor.trim(); // eat whitespace between optionally title and closing `)`

	// includes backticks that invalidates "](" pattern
	const invalid = name.includes('`') && href.includes('`');
	if (invalid || !cursor.eat(')')) return null; // closing `)` is required

	return {
		type: 'inline:link',
		attr: { href, title: title.trim() },
		children: annotate(name),
	};
}

export function text({ cursor, stack }: Context): null | {
	type: 'inline:text';
	text: string;
} {
	const char = cursor.read(1);
	const last = stack.peek();
	if (last?.type === 'inline:text') {
		last.text += char;
		return last;
	}

	return stack.push({ type: 'inline:text', text: char });
}

// --- modifier registries ---

export function emphasis({ cursor, is, annotate }: Context): null | {
	type: 'modifier:emphasis';
	children: Token[];
} {
	const before = cursor.see(-1);
	const after = cursor.see(1);
	if (!is['left-flanking'](before, after)) return null;

	const char = cursor.read(1);
	// double asterisk handled by `modifier:strong`
	if (char !== '*' && char !== '_') return null;
	if (before === char) return null; // failed strong rule
	if (cursor.peek(char)) return null; // immediately closed

	// underscore cannot be used for emphasis inside words
	// https://spec.commonmark.org/0.31.2/#example-360
	if (char === '_' && is.alphanumeric(before) && is.alphanumeric(after)) return null;

	const body = cursor.consume(char, (i) => {
		const before = cursor.see(i - cursor.index - 1);
		const after = cursor.see(i - cursor.index + 1);
		// https://spec.commonmark.org/0.31.2/#example-374
		if (char === '_' && is.alphanumeric(before) && is.alphanumeric(after)) return false;
		return is['right-flanking'](before, after);
	});
	const invalid = body.includes('`') && cursor.peek(/`/);
	if (!body.length || invalid) return null;
	cursor.eat(char);

	const children = annotate(body);
	return { type: 'modifier:emphasis', children };
}

export function strike({ cursor, is, annotate }: Context): null | {
	type: 'modifier:strike';
	children: Token[];
} {
	if (!is['left-flanking'](cursor.see(-1), cursor.see(2))) return null;

	if (!cursor.eat('~~')) return null;
	const body = cursor.locate(/~~/);
	const invalid = body.includes('`') && cursor.peek(/`/);
	if (!body.length || invalid) return null;
	if (!is['right-flanking'](cursor.see(-2), cursor.see(1))) return null;
	cursor.eat('~~');

	const children = annotate(body);
	return { type: 'modifier:strike', children };
}

export function strong({ cursor, is, annotate }: Context): null | {
	type: 'modifier:strong';
	children: Token[];
} {
	if (!is['left-flanking'](cursor.see(-1), cursor.see(2))) return null;
	if (!cursor.eat('**')) return null;
	const body = cursor.consume('**', (i) => {
		const before = cursor.see(i - cursor.index - 1);
		const after = cursor.see(i - cursor.index + 2);
		return is['right-flanking'](before, after);
	});
	const invalid = body.includes('`') && cursor.peek(/`/);
	if (!body.length || invalid) return null;
	cursor.eat('**');
	const children = annotate(body);
	return { type: 'modifier:strong', children };
}
