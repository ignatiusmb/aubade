import type { Context } from '../engine.js';

export function code({ cursor }: Context): null | {
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

export function linebreak({ cursor }: Context): null | {
	type: 'block:break';
} {
	const source = cursor.locate(/\n|$/).trim();
	if (!['---', '***', '___'].includes(source)) return null;
	return { type: 'block:break' };
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
