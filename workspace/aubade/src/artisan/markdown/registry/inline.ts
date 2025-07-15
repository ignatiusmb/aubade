import type { Context, Token } from '../engine.js';

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
		href = text;
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
export function code({ cursor }: Context): null | {
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

export function comment({ cursor }: Context): null | {
	type: 'inline:comment';
	text: string;
} {
	if (!cursor.eat('<!--')) return null;
	const comment = cursor.locate(/-->/);
	if (!comment.length) return null;
	cursor.eat('-->');
	return { type: 'inline:comment', text: comment.trim() };
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
