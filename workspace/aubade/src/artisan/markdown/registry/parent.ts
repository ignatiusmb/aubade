import type { Context, Token } from '../engine.js';

export function heading({ cursor, stack }: Context): null | {
	type: 'parent:heading';
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

	const sibling = stack.find('parent:heading', (token) => token.meta.level === level);
	if (sibling) stack.remove(sibling);

	const parent = stack.find('parent:heading', (token) => token.meta.level === level - 1);

	const id = `${parent?.attr.id || ''}-${title.toLowerCase()}`
		.replace(/[\s\][!"#$%&'()*+,./:;<=>?@\\^_`{|}~-]+/g, '-')
		.replace(/^-+|-+$|(?<=-)-+/g, '');

	return stack.push({
		type: 'parent:heading',
		text: title,
		attr: { id },
		meta: { level },
		children: [],
	});
}

export function html({ cursor, parse }: Context): null | {
	type: 'parent:html';
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
	parse; // recursive call to parse the inner HTML

	const html = cursor.locate(new RegExp(`</${tag}>`));
	if (!html.length) return null;
	cursor.eat(`</${tag}>`);

	return {
		type: 'parent:html',
		text: html,
		attr: {},
		children: [],
	};
}

export function paragraph({ cursor, stack }: Context): null | {
	type: 'parent:paragraph';
	text: string;
	children: Token[];
} {
	const text = cursor.locate(/\n|$/).trim();
	cursor.eat('\n'); // eat the newline character

	const last = stack.peek();
	if (last?.type === 'parent:paragraph') {
		last.text += '\n' + text;
		return last;
	}

	return stack.push({
		type: 'parent:paragraph',
		text: text,
		children: [],
	});
}

export function quote({ cursor, parse, stack }: Context): null | {
	type: 'parent:quote';
	children: Token[];
} {
	const match = cursor.eat('>');
	if (!match) return null;

	const body = cursor.locate(/\n|$/).trim();
	const { children } = parse(body);
	const last = stack.peek();
	if (last?.type === 'parent:quote') {
		last.children.push(...children);
		return last;
	}

	return stack.push({ type: 'parent:quote', children });
}
