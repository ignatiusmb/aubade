import type { MarquaTable } from './types';
import { separators } from './helper';

export function id(title: string): string {
	title = title.toLowerCase().replace(separators, '-');
	return title.replace(/-+/g, '-').replace(/^-*(.+)-*$/, '$1');
}

export function readTime(content: string): number {
	const paragraphs = content.split('\n').filter(
		(p) => !!p && !/^[!*]/.test(p) // remove empty and not sentences
	);
	const words = paragraphs.reduce((acc, cur) => {
		if (/^[\t\s]*<.+>/.test(cur.trim())) return acc + 1;
		return acc + cur.split(' ').filter((w) => !!w && /\w|\d/.test(w) && w.length > 2).length;
	}, 0);
	const images = content.match(/!\[.+\]\(.+\)/g);
	const total = words + (images || []).length * 12;
	return Math.round(total / 240) || 1;
}

export function table(content: string) {
	const lines = content.split('\n').filter((l) => !!l.trim() && /^#{2,4} .+/.test(l));
	const someTitle = lines.some((l) => l.startsWith('## '));
	return lines.reduce((table: MarquaTable[], line) => {
		const isTitle = line.startsWith('## ');
		line = line.replace(/^#{2,4} (.+)/, '$1').trim();
		line = line.replace(/\[(.+)\]\(.+\)/g, '$1');
		line = line.replace(/`(.+)`/g, '$1');
		if (!someTitle || isTitle) {
			table.push({ id: id(line), cleaned: line, sections: [] });
		} else if (table.length) {
			const lastTitle = table[table.length - 1];
			lastTitle.sections.push({ id: id(line), cleaned: line });
		}
		return table;
	}, []);
}
