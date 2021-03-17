import type { HydrateFn } from './types';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { compareDate, compareString } from './helper';
import { contentParser, countReadTime, extractMeta, generateId, traverseCompare } from './utils';
import marker from './marker';

export function parseFile<I, O = I>(pathname: string, hydrate: HydrateFn<I, O>): O;
export function parseFile<I, O = I>(pathname: string, hydrate: HydrateFn<I, O>): O | undefined {
	const content = readFileSync(pathname, 'utf-8');
	const fmExpression = /---\r?\n([\s\S]+?)\r?\n---/;
	const [rawData, metadata] = fmExpression.exec(content) || ['', ''];

	const extracted = extractMeta(metadata);
	const [filename] = pathname.split(/[/\\]/).slice(-1);
	const article = metadata ? content.slice(rawData.length + 1) : content;
	const result = <typeof extracted>(
		hydrate({ frontMatter: <I>extracted, content: article, filename })
	);
	if (!result) return;

	const headings = Array.from(article.match(/^## (.*)/gm) || [], (v) => v.slice(3));
	result.toc = headings.map((raw) => ({ id: generateId(raw), cleaned: raw.split(' | ')[0] }));
	result.read_time = countReadTime(article);
	if (result.date && result.date.published && !result.date.updated) {
		result.date.updated = result.date.published;
	}

	if (result.content) {
		const { content, ...rest } = result;
		result.content = contentParser(rest, content);
		result.content = marker.render(result.content);
	}
	return result as O;
}

export function parseDir<I, O = I>(dirname: string, hydrate: HydrateFn<I, O>): O[];
export function parseDir<I, O extends Record<string, any> = I>(
	dirname: string,
	hydrate: HydrateFn<I, O>
): Array<O | undefined> {
	return readdirSync(dirname)
		.filter((name) => !name.startsWith('draft.') && name.endsWith('.md'))
		.map((filename) => parseFile(join(dirname, filename), hydrate))
		.sort((x, y) => {
			if (x.date && y.date) {
				if (typeof x.date === 'string' && typeof y.date === 'string')
					if (x.date !== y.date) return compareString(x.date, y.date);
				const { updated: xu, published: xp } = x.date;
				const { updated: yu, published: yp } = y.date;
				if (xu && yu && xu !== yu) return compareDate(xu, yu);
				if (xp && yp && xp !== yp) return compareDate(xp, yp);
			}
			return traverseCompare(x, y);
		});
}
