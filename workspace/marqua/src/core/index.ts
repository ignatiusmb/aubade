import type { MarquaTable } from '../types.js';
import { exists } from 'mauss/guards';
import { generate } from '../utils.js';

export function parse(source: string) {
	const match = source.match(/---\r?\n([\s\S]+?)\r?\n---/);
	const trimmed = (match && match[1].trim()) || '';
	const memory: Record<string, any> = {};

	for (const line of trimmed.split(/\r?\n/).filter(exists)) {
		const match = line.trim().match(/([:\w\d]+): (.+)/);
		if (!match || (match && !match[2].trim())) continue;

		const [key, data] = match.slice(1).map((g) => g.trim());
		if (/:/.test(key)) {
			const [parent, ...rest] = key.split(':');
			memory[parent] = nest(data, rest);
			continue;
		}

		memory[key] = data; // else -> standard assignment
	}

	const crude = source.slice(match ? (match.index || 0) + match[0].length + 1 : 0);
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
				const images = crude.match(/!\[.+\]\(.+\)/g);
				const total = words + (images || []).length * 12;
				return Math.round(total / 240) || 1;
			},

			/** table of contents */
			get table() {
				const lines: RegExpMatchArray[] = [];
				const counter = [0, 0, 0];
				for (const line of crude.split('\n')) {
					const match = line.trim().match(/^(#{2,4}) (.+)/);
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

function nest(val: string, keys: string[], memo: Record<string, any> = {}): string | typeof memo {
	return !keys.length ? val : { ...memo, [keys[0]]: nest(val, keys.slice(1), memo[keys[0]]) };
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
