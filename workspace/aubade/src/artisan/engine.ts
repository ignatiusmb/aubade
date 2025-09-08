import type { Annotation, Block } from './registry.js';
import { type Context, contextualize, match } from './context.js';
import * as registry from './registry.js';

/** create the root document from the source */
export function compose(source: string): { type: ':document'; children: Block[] } {
	const root = { type: ':document' as const, children: [] as Block[] };
	const tree = root.children.slice();
	const stack = new Proxy({} as Context['stack'], {
		get(target, key: keyof Context['stack']) {
			const container = target[key] || [];
			target[key] = container as any;
			return target[key];
		},
	});

	const dispatch = new Map([
		['\\', []], // escape falls back to paragraph
		['<', [registry.comment, registry.markup]],
		['#', [registry.heading]],
		['`', [registry.codeblock]],
		['>', [registry.quote]],
		['!', [registry.figure]],
		['-', [registry.divider, registry.list]],
		['*', [registry.divider, registry.list]],
		['+', [registry.list]],
		['_', [registry.divider]],
	]);

	let index = 0;
	while (index < source.length) {
		const cursor = contextualize(source.slice(index));
		if (cursor.eat('\n')) {
			while (cursor.eat('\n'));
			clear(['block:paragraph']);
		}

		const rules = dispatch.get(source[index + cursor.index]) || [
			registry.divider,
			registry.heading,
			registry.codeblock,
			registry.quote,
			registry.list,
		];
		const token = match({ cursor, stack, rules });
		if (token) {
			if (token !== tree[tree.length - 1]) tree.push(token);
			clear([token.type !== 'block:list' && 'block:list', 'block:paragraph']);
		} else {
			const text = cursor.locate(/\n|$/);
			cursor.eat('\n'); // eat the line feed

			const q = stack['block:paragraph'];
			if (q.length) q[q.length - 1].text += '\n' + text;
			else {
				q.push({ type: 'block:paragraph', children: [], text });
				tree.push(q[q.length - 1]);
				clear(['block:list']);
			}
		}
		index += cursor.index;
	}

	for (const parent of tree) {
		if (parent.type !== 'block:paragraph') root.children.push(parent);
		else if (parent.text && parent.text.trim()) {
			const children = annotate(parent.text.trim());
			root.children.push({ type: 'block:paragraph', children });
		}
	}

	return root;

	function clear(blocks: Array<false | keyof Context['stack']>) {
		for (const type of blocks) {
			if (!type) continue;
			while (stack[type].length) {
				stack[type].pop();
			}
		}
	}
}

type Run = NonNullable<ReturnType<typeof registry.delimiter>>;
/** construct inline tokens from the source */
export function annotate(source: string): Annotation[] {
	const runs: Array<Annotation | Run> = [];
	const stack = new Proxy({} as Context['stack'], {
		get(target, key: keyof Context['stack']) {
			const container = target[key] || [];
			target[key] = container as any;
			return target[key];
		},
	});

	const dispatch = new Map([
		['\\', [registry.escape]],
		['<', [registry.comment, registry.markup, registry.autolink]],
		['`', [registry.codespan]],
		['!', [registry.image]],
		['[', [registry.link]],
		['*', [registry.delimiter]],
		['_', [registry.delimiter]],
		['~', [registry.delimiter]],
	]);

	let index = 0;
	const cursor = contextualize(source);
	while (index < source.length) {
		cursor.index = index;
		const rules = dispatch.get(source[index]) || [registry.autolink];
		const token = match({ cursor, stack, rules });
		if (token) runs.push(token);
		else {
			const bs = cursor.eat('\\'); // backslash hard break
			const char = cursor.read(1);
			const last = runs[runs.length - 1];
			if (last?.type === 'inline:text') {
				const linebreak = bs || / {2,}$/.test(last.text);
				const lf = char === '\n';
				last.text = lf ? last.text.trimEnd() : last.text;
				lf && cursor.trim();
				if (!lf || !linebreak) last.text += char || '\\';
				else runs.push({ type: 'inline:break' });
			} else {
				runs.push({ type: 'inline:text', text: char });
			}
		}
		index = cursor.index;
	}

	return pair(runs);
}

type Stack = { run: Run; tokens: Annotation[] }[];
function pair(runs: Array<Annotation | Run>): Annotation[] {
	const root: Annotation[] = [];
	const stack: Stack = [];
	for (const current of runs) {
		if (current.type !== 'aubade:delimiter') {
			const tree = stack[stack.length - 1]?.tokens || root;
			tree.push(current);
			continue;
		}

		if (!current.meta.count) continue;
		if (current.meta.can.close && stack.length > 0) {
			const { run: opening, tokens } = stack.pop()!;
			if (current.meta.can.open && current.meta.count > opening.meta.count) {
				stack.push({ run: opening, tokens }, { run: current, tokens: [] });
				continue;
			} else if (opening.meta.char !== current.meta.char) {
				const text = current.meta.char.repeat(current.meta.count);
				stack.push({ run: opening, tokens: [...tokens, { type: 'inline:text', text }] });
				continue;
			}
			const tree = stack[stack.length - 1]?.tokens || root;
			tree.push(close(opening, current, tokens));

			if (opening.meta.count) {
				if (tree !== root) stack[stack.length - 1].tokens = [];
				stack.push({ run: opening, tokens: tree.slice() });
				if (tree === root) root.length = 0;
			}
			while (current.meta.count) {
				if (!stack.find(({ run }) => run.meta.char === current.meta.char)) {
					const remainder = current.meta.char.repeat(current.meta.count);
					const tree = stack[stack.length - 1]?.tokens || root;
					tree.push({ type: 'inline:text', text: remainder });
					break;
				}

				const { run, tokens } = stack.pop()!;
				const tree = stack[stack.length - 1]?.tokens || root;
				if (run.meta.char !== current.meta.char) {
					const remainder = current.meta.char.repeat(current.meta.count);
					tree.push({ type: 'inline:text', text: remainder });
				} else tree.push(...pair([run, ...tokens, current]));
			}
		} else if (current.meta.can.open) {
			stack.push({ run: current, tokens: [] });
		} else {
			const tree = stack[stack.length - 1]?.tokens || root;
			const remainder = current.meta.char.repeat(current.meta.count);
			tree.push({ type: 'inline:text', text: remainder });
		}
	}
	for (const { run, tokens } of stack) {
		const remainder = run.meta.char.repeat(run.meta.count);
		root.push({ type: 'inline:text', text: remainder }, ...tokens);
	}
	return root;

	function close(opening: Run, current: Run, children: Annotation[]): Annotation {
		const used = Math.min(opening.meta.count, current.meta.count, 2);
		const mod = current.meta.char !== '~' ? (used > 1 ? 'strong' : 'emphasis') : 'strike';

		opening.meta.count -= used;
		current.meta.count -= used;

		return { type: `inline:${mod}`, children };
	}
}
