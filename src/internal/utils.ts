import type { MarquaTable } from './types';
import { checkNum } from 'mauss/utils';
import { clean, compareString } from './helper';

const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;

export function contentParser(data: Record<string, any>, content: string): string {
	const traverse = (meta: string | Record<string, any>, properties: string): string => {
		for (const key of properties.split(':'))
			if (typeof meta !== 'string') meta = meta[checkNum(key)];
		return JSON.stringify(meta);
	};

	return content.replace(/#{(.+)}!/g, (s, c) => (c && traverse(data, c)) || s);
}

export function countReadTime(content: string): number {
	const paragraphs = content.split('\n').filter(
		(p) => !!p && !/^[!*]/.test(p) // remove empty and not sentences
	);
	const words = paragraphs.reduce((acc, cur) => {
		if (/^[\t\s]*<.+>/.test(cur.trim())) return acc + 1;
		return acc + clean(cur.trim().split(' ')).length;
	}, 0);
	const images = content.match(/!\[.+\]\(.+\)/g);
	const total = words + (images || []).length * 12;
	return Math.round(total / 240) || 1;
}

export function extractMeta(metadata: string) {
	const lines = clean(metadata.split(/\r?\n/));
	if (!lines.length) return {};

	const ignored = ['title', 'description'];
	const traverse = (
		curr: Record<string, any>,
		keys: string[],
		val: string | string[]
	): string | string[] | Record<string, any> => {
		if (!keys.length) return val instanceof Array ? clean(val) : val;
		return { ...curr, [keys[0]]: traverse(curr[keys[0]] || {}, keys.slice(1), val) };
	};

	return lines.reduce((acc: Record<string, any>, cur) => {
		const match = cur.trim().match(/([:\w]+): (.+)/);
		if (!match || (match && !match[2].trim())) return acc;
		const [key, data] = match.slice(1).map((g) => g.trim());
		const val = /,/.test(data) ? data.split(',').map((v) => v.trim()) : data;
		if (/:/.test(key)) {
			const [attr, ...keys] = clean(key.split(':'));
			const initial = ignored.includes(attr) ? data : val;
			acc[attr] = traverse(acc[attr] || {}, keys, initial);
		} else if (ignored.includes(key)) acc[key] = data;
		else acc[key] = val instanceof Array ? clean(val) : val;
		return acc;
	}, {});
}

export function generateId(title: string): string {
	title = title.toLowerCase().replace(separators, '-');
	return title.replace(/-+/g, '-').replace(/^-*(.+)-*$/, '$1');
}

export function generateTable(content: string) {
	const lines = content.split('\n').filter((l) => !!l.trim() && /^#{2,3} \w+/.test(l));
	return lines.reduce((table: MarquaTable[], line) => {
		const isTitle = line.startsWith('## ');
		line = line.replace(/^#{2,3} (.+)/, '$1');
		line = line.replace(/\[(.+)\]\(.+\)/g, '$1');
		const id = generateId(line);
		if (!isTitle) {
			const lastTitle = table[table.length - 1];
			lastTitle.sections.push({ id, cleaned: line });
		} else table.push({ id, cleaned: line, sections: [] });
		return table;
	}, []);
}

export function traverseCompare(x: Record<string, any>, y: Record<string, any>): number {
	const common = [...new Set([...Object.keys(x), ...Object.keys(y)])].filter(
		(k) => k in x && k in y && typeof x[k] === typeof y[k] && x[k] !== y[k]
	);
	for (let i = 0, key = common[i]; i < common.length; key = common[++i]) {
		if (x[key] === null && y[key] === null) continue;
		if (typeof x[key] === 'string') return compareString(x[key], y[key]);
		if (typeof x[key] === 'object') return traverseCompare(x[key], y[key]);
	}
	return 0;
}
