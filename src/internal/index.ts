import type { DirOptions, FileOptions, HydrateFn } from './types';
import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { isExists } from 'mauss/guards';

import { readTime, structure, table } from './compute';
import { compareString } from './helper';
import { comparator, construct, supplant } from './utils';

export function compile<I, O extends Record<string, any> = I>(
	options: string | FileOptions,
	hydrate?: HydrateFn<I, O>
): O | undefined {
	const { entry, minimal = !1, exclude = [] } =
		typeof options !== 'string' ? options : { entry: options };

	const crude = readFileSync(entry, 'utf-8').trim();
	const match = crude.match(/---\r?\n([\s\S]+?)\r?\n---/);
	const [filename] = entry.split(/[/\\]/).slice(-1);

	const metadata = construct((match && match[1].trim()) || '');
	const sliceIdx = match ? (match.index || 0) + match[0].length + 1 : 0;
	const content = supplant(metadata, crude.slice(sliceIdx));
	if (!minimal) {
		if (!exclude.includes('toc')) metadata.toc = table(content);
		if (!exclude.includes('rt')) metadata.read_time = readTime(content);
	}
	const result = !hydrate
		? ({ ...metadata, content } as Record<string, any>)
		: hydrate({ frontMatter: <I>metadata, content, filename });

	if (!result /* hydrate is used and returns undefined */) return;

	if (!minimal && result.date && typeof result.date !== 'string' && !exclude.includes('date'))
		result.date.updated = result.date.updated || result.date.published;
	if (result.content && typeof result.content === 'string')
		result.content = structure(result.content, minimal || exclude.includes('cnt'));
	return result as O;
}

export function traverse<I, O extends Record<string, any> = I>(
	options: string | DirOptions,
	hydrate?: HydrateFn<I, O>
): Array<O> {
	const { entry, extensions = ['.md'], ...config } =
		typeof options !== 'string' ? options : { entry: options };

	if (!existsSync(entry)) return console.warn(`Path "${entry}" does not exists!`), [];

	return readdirSync(entry)
		.filter((name) => !name.startsWith('draft.') && extensions.some((ext) => name.endsWith(ext)))
		.map((filename) => compile({ entry: join(entry, filename), ...config }, hydrate))
		.filter(isExists)
		.sort((x, y) => {
			if (x.date && y.date) {
				if (typeof x.date === 'string' && typeof y.date === 'string')
					if (x.date !== y.date) return compareString(x.date, y.date);
				const { updated: xu = '', published: xp = '' } = x.date;
				const { updated: yu = '', published: yp = '' } = y.date;
				if (xu && yu && xu !== yu) return compareString(xu, yu);
				if (xp && yp && xp !== yp) return compareString(xp, yp);
			}
			return comparator(x, y);
		});
}
