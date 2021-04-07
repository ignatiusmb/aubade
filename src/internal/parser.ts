import type { HydrateFn } from './types';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { isExists } from 'mauss/guards';
import { compareString } from './helper';
import { contentParser, countReadTime, extractMeta, generateTable, traverseCompare } from './utils';
import marker from './marker';

export function parseFile<I, O = I>(pathname: string, hydrate: HydrateFn<I, O>): O;
export function parseFile<I, O = I>(pathname: string, hydrate: HydrateFn<I, O>): O | undefined {
	const crude = readFileSync(pathname, 'utf-8').trim();
	const match = crude.match(/---\r?\n([\s\S]+?)\r?\n---/);
	const [filename] = pathname.split(/[/\\]/).slice(-1);

	const metadata = extractMeta((match && match[1].trim()) || '');
	const sliceIdx = match ? (match.index || 0) + match[0].length + 1 : 0;
	const content = contentParser(metadata, crude.slice(sliceIdx));
	metadata.toc = generateTable(content);
	metadata.read_time = countReadTime(content);
	const result = <typeof metadata>hydrate({ frontMatter: <I>metadata, content, filename });
	if (!result) return;

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

export function parseDir<I, O = I>(dirname: string, hydrate: HydrateFn<I, O>): Array<O>;
export function parseDir<I, O extends Record<string, any> = I>(
	dirname: string,
	hydrate: HydrateFn<I, O>
): Array<O> {
	return readdirSync(dirname)
		.filter((name) => !name.startsWith('draft.') && name.endsWith('.md'))
		.map((filename) => parseFile(join(dirname, filename), hydrate))
		.filter(isExists)
		.sort((x, y) => {
			if (x.date && y.date) {
				if (typeof x.date === 'string' && typeof y.date === 'string')
					if (x.date !== y.date) return compareString(x.date, y.date);
				const { updated: xu, published: xp } = x.date;
				const { updated: yu, published: yp } = y.date;
				if (xu && yu && xu !== yu) return compareString(xu, yu);
				if (xp && yp && xp !== yp) return compareString(xp, yp);
			}
			return traverseCompare(x, y);
		});
}
