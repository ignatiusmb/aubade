import type { Context, Token } from '../engine.js';

export function emphasis({ cursor, is, annotate }: Context): null | {
	type: 'modifier:emphasis';
	children: Token[];
} {
	if (!is['left-flanking'](1)) return null;

	// double asterisk handled by `modifier:strong`
	const char = cursor.read(1);
	if (char !== '*' && char !== '_') return null;

	const body = cursor.locate(char === '*' ? /\*/ : /_/);
	const invalid = body.includes('`') && cursor.peek(/`/);
	if (!body.length || invalid) return null;
	if (!is['right-flanking'](1)) return null;
	cursor.eat(char);

	const children = annotate(body);
	return { type: 'modifier:emphasis', children };
}

export function strike({ cursor, is, annotate }: Context): null | {
	type: 'modifier:strike';
	children: Token[];
} {
	if (!is['left-flanking'](2)) return null;

	if (!cursor.eat('~~')) return null;
	const body = cursor.locate(/~~/);
	const invalid = body.includes('`') && cursor.peek(/`/);
	if (!body.length || invalid) return null;
	if (!is['right-flanking'](2)) return null;
	cursor.eat('~~');

	const children = annotate(body);
	return { type: 'modifier:strike', children };
}

export function strong({ cursor, is, annotate }: Context): null | {
	type: 'modifier:strong';
	children: Token[];
} {
	if (!is['left-flanking'](2)) return null;
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
	if (!is['right-flanking'](2)) return null;
	cursor.eat('*');
	const children = annotate(body);
	return { type: 'modifier:strong', children };
}
