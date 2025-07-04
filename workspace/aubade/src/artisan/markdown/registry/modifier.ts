import type { Context } from '../engine.js';

export function emphasis({ cursor, stack }: Context): null | {
	type: 'modifier:emphasis';
	meta: { delimiter: string; type: 'open' | 'close' };
} {
	// double asterisk handled by `modifier:strong`
	const char = cursor.read(1);
	if (char !== '*' && char !== '_') return null;
	const last = stack.peek();
	const opened = stack.find('modifier:emphasis');
	if (opened) {
		stack.remove(opened);
		if (last?.type !== 'inline:text') {
			// @ts-expect-error - is there a better way?
			opened.type = 'inline:text';
			// @ts-expect-error - see above
			opened.text = char + char;
			// @ts-expect-error - remove excess
			delete opened.meta;
			return opened;
		}
		return {
			type: 'modifier:emphasis',
			meta: { delimiter: char, type: 'close' },
		};
	}
	return stack.push({
		type: 'modifier:emphasis',
		meta: { delimiter: char, type: 'open' },
	});
}

export function strike({ cursor, stack }: Context): null | {
	type: 'modifier:strike';
	meta: { delimiter: string; type: 'open' | 'close' };
} {
	if (!cursor.eat('~~')) return null;
	const opened = stack.find('modifier:strike');
	if (opened) {
		stack.remove(opened);
		return {
			type: 'modifier:strike',
			meta: { delimiter: '~~', type: 'close' },
		};
	}
	return stack.push({
		type: 'modifier:strike',
		meta: { delimiter: '~~', type: 'open' },
	});
}

export function strong({ cursor, stack }: Context): null | {
	type: 'modifier:strong';
	meta: { delimiter: string; type: 'open' | 'close' };
} {
	if (!cursor.eat('**')) return null;
	if (stack.find('modifier:emphasis')) return null;
	const opened = stack.find('modifier:strong');
	if (opened) {
		stack.remove(opened);
		return {
			type: 'modifier:strong',
			meta: { delimiter: '**', type: 'close' },
		};
	}
	return stack.push({
		type: 'modifier:strong',
		meta: { delimiter: '**', type: 'open' },
	});
}
