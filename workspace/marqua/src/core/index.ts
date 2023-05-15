import type { MarquaTable } from '../types.js';
import { generate } from '../utils.js';

export function parse(source: string) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(source);
	const crude = source.slice(match ? match.index + match[0].length + 1 : 0);
	const memory = construct((match && match[1].trim()) || '') as Record<string, any>;

	return {
		content: inject(crude, memory),
		metadata: Object.assign(memory, {
			/** estimated reading time */
			get estimate() {
				const paragraphs = crude.split('\n').filter(
					(p) => !!p && !/^[!*]/.test(p) // remove empty and not sentences
				);
				const words = paragraphs.reduce((total, line) => {
					if (/^[\t\s]*<.+>/.test(line.trim())) return total + 1;
					const accumulated = line.split(' ').filter((w) => !!w && /\w|\d/.test(w) && w.length > 1);
					return total + accumulated.length;
				}, 0);
				const images = /!\[.+\]\(.+\)/g.exec(crude);
				const total = words + (images || []).length * 12;
				return Math.round(total / 240) || 1;
			},

			/** table of contents */
			get table() {
				const lines: RegExpMatchArray[] = [];
				const counter = [0, 0, 0];
				for (const line of crude.split('\n')) {
					const match = /^(#{2,4}) (.+)/.exec(line.trim());
					if (match) lines.push(match), counter[match[1].length - 2]++;
				}
				const alone = counter.filter((i) => i === 0).length === 2;

				return lines.reduce((table: MarquaTable[], [, signs, title]) => {
					title = title.replace(/\[(.+)\]\(.+\)/g, '$1');
					title = title.replace(/`(.+)`/g, '$1');
					const content = { id: generate.id(title), title };

					if (alone || (!counter[0] && signs.length === 3) || signs.length === 2) {
						table.push(content);
					} else if (table.length) {
						let parent = table[table.length - 1];
						if (!parent.sections) parent.sections = [];
						if ((!counter[0] && signs.length === 4) || signs.length === 3) {
							parent.sections.push(content);
						} else if (counter[0] && parent.sections.length && signs.length === 4) {
							parent = parent.sections[parent.sections.length - 1];
							if (!parent.sections) parent.sections = [content];
							else parent.sections.push(content);
						}
					}
					return table;
				}, []);
			},
		}),
	};
}

type Primitives = string | boolean | null;
type FrontMatter = { [key: string]: Primitives | Primitives[] | FrontMatter | FrontMatter[] };
export function construct(raw: string, memo: Record<string, any> = {}): FrontMatter[string] {
	if (!/[:\-\[\]|#]/gm.test(raw)) return coerce(raw.trim());
	if (/^(".*"|'.*')$/.test(raw.trim())) return raw.trim().slice(1, -1);

	const PATTERN = /(^[^:\s]+):(?!\/)\r?\n?([\s\S]*?(?=^\S)|[\s\S]*$)/gm;
	let match: null | RegExpExecArray;
	while ((match = PATTERN.exec(raw))) {
		const [, key, value] = match;
		const data = construct(outdent(value), memo[key]);
		if (Array.isArray(data) || typeof data !== 'object') memo[key] = data;
		else memo[key] = { ...memo[key], ...data };
	}

	if (Object.keys(memo).length) return memo;

	const cleaned = raw.replace(/#.*$/gm, '').trim();
	switch (cleaned[0]) {
		case '-': {
			const sequence = cleaned.split('- ').filter((v) => v);
			const tabbed = sequence.map((v) =>
				v.replace(/\n( +)/g, (_, s) => '\n' + '\t'.repeat(s.length / 2))
			);
			// @ts-expect-error - `FrontMatter` is assignable to itself
			return tabbed.map((v) => construct(outdent(` ${v}`)));
		}
		case '[': {
			const pruned = cleaned.slice(1, -1);
			return pruned.split(',').map(coerce);
		}
		case '|': {
			return outdent(cleaned.slice(1).replace('\n', ''));
		}
		default: {
			return coerce(cleaned.trim());
		}
	}
}

// ---- internal functions ----

function coerce(u: string) {
	const v = u.trim(); // argument can be passed as-is
	const map = { true: true, false: false, null: null };
	if (v in map) return map[v as keyof typeof map];
	// if (!Number.isNaN(Number(v))) return Number(v);
	return /^(".*"|'.*')$/.test(v) ? v.slice(1, -1) : v;
}

function outdent(input: string) {
	const lines = input.split(/\r?\n/).filter((l) => l.trim());
	const indent = (/^\s*/.exec(lines[0]) || [''])[0].length;
	return lines.map((l) => l.slice(indent)).join('\n');
}

function inject(source: string, metadata: Record<string, any>) {
	const plane = compress(metadata);
	return source.replace(/!{(.+)}/g, (s, c) => (c && plane[c]) || s);
}

function compress(metadata: Record<string, any>, parent = '') {
	const memo: typeof metadata = {};
	const prefix = parent ? `${parent}:` : '';
	for (const [k, v] of Object.entries(metadata)) {
		if (typeof v !== 'object') memo[prefix + k] = v;
		else Object.assign(memo, compress(v, k));
	}
	return memo;
}
