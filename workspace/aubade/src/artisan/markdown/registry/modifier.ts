import type { Context, Token } from '../engine.js';

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
	if (cursor.peek(char)) return null; // immediately closed

	// underscore cannot be used for emphasis inside words
	// https://spec.commonmark.org/0.31.2/#example-360
	if (char === '_' && is.alphanumeric(before) && is.alphanumeric(after)) return null;

	const body = cursor.consume(char, (i) => {
		const before = cursor.see(i - cursor.index - 1);
		const after = cursor.see(i - cursor.index + 1);
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
	// prettier-ignore
	let body = '', emphasized = false, char, closed = false;
	while ((char = cursor.read(1))) {
		if (char === '*' && cursor.peek('*') && !emphasized) {
			closed = true;
			break;
		}

		if (char === '*') emphasized = !emphasized;
		body += char;
	}
	const invalid = body.includes('`') && cursor.peek(/`/);
	if (!body.length || !closed || invalid) return null;
	if (!is['right-flanking'](cursor.see(-2), cursor.see(1))) return null;
	cursor.eat('*');
	const children = annotate(body);
	return { type: 'modifier:strong', children };
}
