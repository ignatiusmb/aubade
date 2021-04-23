import type { DirOptions, FileOptions, HydrateFn } from './types';
import { join } from 'path';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'fs';
import { comparator, compare } from 'mauss';

import { readTime, structure, table } from './compute';
import { construct, supplant } from './utils';

export function compile<I, O extends Record<string, any> = I>(
	options: string | FileOptions,
	hydrate?: HydrateFn<I, O>
): O | undefined {
	const { entry, minimal = !1, exclude = [] } =
		typeof options !== 'string' ? options : { entry: options };

	const crude = readFileSync(entry, 'utf-8').trim();
	const match = crude.match(/---\r?\n([\s\S]+?)\r?\n---/);
	const breadcrumb = entry.split(/[/\\]/);

	const metadata = construct((match && match[1].trim()) || '');
	const sliceIdx = match ? (match.index || 0) + match[0].length + 1 : 0;
	const content = supplant(metadata, crude.slice(sliceIdx));
	if (!minimal) {
		if (!exclude.includes('toc')) metadata.toc = table(content);
		if (!exclude.includes('rt')) metadata.read_time = readTime(content);
	}
	const result = !hydrate
		? ({ ...metadata, content } as Record<string, any>)
		: hydrate({ frontMatter: <I>metadata, content, breadcrumb });

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
	const { entry, recurse = !1, extensions = ['.md'], ...config } =
		typeof options !== 'string' ? options : { entry: options };

	if (!existsSync(entry)) {
		console.warn(`Skipping "${entry}", path does not exists`);
		return [];
	}

	const explored = readdirSync(entry).map((name) => {
		const pathname = join(entry, name);
		const opts = { entry: pathname, recurse, extensions, ...config };
		if (recurse && lstatSync(pathname).isDirectory()) {
			return traverse(opts, hydrate);
		} else if (extensions.some((e) => name.endsWith(e))) {
			return compile(opts, hydrate);
		} else return;
	});

	return (recurse ? explored.flat(Number.POSITIVE_INFINITY) : explored)
		.filter((i): i is O => (Array.isArray(i) ? !!i.length : !!i))
		.sort((x, y) => {
			if (x.date && y.date) {
				if (typeof x.date === 'string' && typeof y.date === 'string')
					if (x.date !== y.date) return compare.string(x.date, y.date);
				const { updated: xu = '', published: xp = '' } = x.date;
				const { updated: yu = '', published: yp = '' } = y.date;
				if (xu && yu && xu !== yu) return compare.string(xu, yu);
				if (xp && yp && xp !== yp) return compare.string(xp, yp);
			}
			return comparator(x, y);
		});
}
