import type { MarquaData, MarquaTable } from './types.js';
import { marker } from '../artisan/index.js';
import { generate } from '../utils.js';

export function readTime(content: string): number {
	const paragraphs = content.split('\n').filter(
		(p) => !!p && !/^[!*]/.test(p) // remove empty and not sentences
	);
	const words = paragraphs.reduce((total, line) => {
		if (/^[\t\s]*<.+>/.test(line.trim())) return total + 1;
		const accumulated = line.split(' ').filter((w) => !!w && /\w|\d/.test(w) && w.length > 1);
		return total + accumulated.length;
	}, 0);
	const images = content.match(/!\[.+\]\(.+\)/g);
	const total = words + (images || []).length * 12;
	return Math.round(total / 240) || 1;
}

export function structure(content: string, minimal: boolean): string | MarquaData[] {
	if (minimal) return marker.render(content);
	const tokens = marker.parse(content, {});
	// TODO: Parse and Render Token Individually
	return marker.renderer.render(tokens, marker.options, {});
}

export function table(content: string) {
	const lines: RegExpMatchArray[] = [];
	const counter = [0, 0, 0];
	for (const line of content.split('\n')) {
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
}
