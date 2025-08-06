import type { Annotation, Block, Context } from './engine.js';

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

	// TODO: handle elements without closing tags
	compose; // recursive call to parse the inner HTML

	const close = `</${tag}>`;
	const contents = cursor.locate(new RegExp(close));
	if (!contents.length && !cursor.eat(close)) return null;

	return { type: 'aubade:html', tag, attr, children: [] };

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

export function heading({ annotate, cursor, stack }: Context): null | {
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

	const heading = { type: 'block:heading' as const, meta: { level }, attr, children };
	return stack['block:heading'].push(heading), heading;

	function extract(token: Block | Annotation): string {
		if ('children' in token) return token.children.map(extract).join('');
		return 'text' in token ? token.text : '';
	}
}

export function list({ compose, cursor }: Context): null | {
	type: 'block:list';
	children: Block[];
} {
	const char = cursor.read(1);
	const bullet = char === '-' || char === '*';
	const number = /^\d/.test(char);
	if (!bullet && !number) return null;
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

export function link({ annotate, cursor }: Context): null | {
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

// --- modifier registries ---

export function emphasis({ annotate, cursor, is }: Context): null | {
	type: 'modifier:emphasis';
	children: Annotation[];
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
		const before = cursor.see(i - 1);
		if (before === '\\') return false; // escaped character
		const after = cursor.see(i + 1);
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

export function strike({ annotate, cursor, is }: Context): null | {
	type: 'modifier:strike';
	children: Annotation[];
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

export function strong({ annotate, cursor, is }: Context): null | {
	type: 'modifier:strong';
	children: Annotation[];
} {
	if (!is['left-flanking'](cursor.see(-1), cursor.see(2))) return null;
	if (!cursor.eat('**')) return null;
	const body = cursor.consume('**', (i) => {
		const before = cursor.see(i - 1);
		if (before === '\\') return false; // escaped character
		const after = cursor.see(i + 2);
		return is['right-flanking'](before, after);
	});
	const invalid = body.includes('`') && cursor.peek(/`/);
	if (!body.length || invalid) return null;
	cursor.eat('**');
	const children = annotate(body);
	return { type: 'modifier:strong', children };
}
