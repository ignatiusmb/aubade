import type { Annotation, Block, Context } from './context.js';
import { contextualize, match } from './context.js';
import * as registry from './registry.js';

const dispatch = new Map([
	['\\', []], // escape falls back to paragraph
	['<', [registry.comment, registry.markup]],
	['`', [registry.codeblock]],
	['#', [registry.heading]],
	['>', [registry.quote]],
	['-', [registry.divider, registry.list]],
	['*', [registry.divider, registry.list]],
	['_', [registry.divider]],
]);

/** create the root document from the source */
export function compose(source: string): { type: ':document'; children: Block[] } {
	const root = { type: ':document' as const, children: [] as Block[] };
	const input = source.trim();
	const tree = root.children;
	const stack = new Proxy({} as Context['stack'], {
		get(target, key: keyof Context['stack']) {
			const container = target[key] || [];
			target[key] = container as any;
			return target[key];
		},
	});

	let index = 0;
	while (index < input.length) {
		const cursor = contextualize(input.slice(index));
		if (cursor.eat('\n')) {
			for (const type of ['block:paragraph', 'block:quote'] as const) {
				while (stack[type].length) stack[type].pop();
			}
		}

		const start = dispatch.get(input[index + cursor.index]);
		const rules = start || [registry.divider, registry.heading];
		const token = match({ cursor, stack, rules });
		if (token) {
			if (token !== tree[tree.length - 1]) tree.push(token);
		} else {
			const text = cursor.locate(/\n|$/).trim();
			cursor.eat('\n'); // eat the line feed

			const q = stack['block:paragraph'];
			if (q.length) q[q.length - 1].text += '\n' + text;
			else {
				const p = { type: 'block:paragraph' as const, children: [], text };
				tree.push(p), q.push(p);
			}
		}
		index += cursor.index;
	}

	for (const parent of tree) {
		if (parent.type !== 'block:paragraph' || !parent.text) continue;
		parent.children = annotate(parent.text);
		// @TODO: make it configurable
		delete parent.text; // cleanup text after inline parsing
	}

	return root;
}

/** construct inline tokens from the source */
export function annotate(source: string): Annotation[] {
	const tree: Annotation[] = [];
	const stack = new Proxy({} as Context['stack'], {
		get(target, key: keyof Context['stack']) {
			const container = target[key] || [];
			target[key] = container as any;
			return target[key];
		},
	});

	let index = 0;
	const cursor = contextualize(source);
	while (index < source.length) {
		cursor.index = index;
		const token = match({
			cursor,
			stack,
			rules: [
				// order matters
				registry.linebreak,
				registry.escape,
				registry.comment,
				registry.codespan,
				registry.autolink,
				registry.image,
				registry.link,
				registry.strong,
				registry.emphasis,
				registry.strike,
			],
		});
		if (token) tree.push(token);
		else {
			const char = cursor.read(1);
			const last = tree[tree.length - 1];
			if (last?.type === 'inline:text') last.text += char;
			else tree.push({ type: 'inline:text', text: char });
		}
		index = cursor.index;
	}
	return tree;
}
