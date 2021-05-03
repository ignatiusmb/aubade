import type { DirOptions, FileOptions, FrontMatter, HydrateFn, ParserTypes } from './types';
import fs from 'fs';
import path from 'path';

import { readTime, structure, table } from './compute';
import { construct, supplant } from './utils';

export function compile<
	Options extends FileOptions,
	Input extends object,
	Output extends Record<string, any> = Input
>(
	options: string | Options,
	hydrate?: HydrateFn<Options, Input, Output>,
	_types?: ParserTypes<Input, Output>
): void | Output {
	const { entry, minimal = !1, exclude = [] } =
		typeof options !== 'string' ? options : { entry: options };

	if (!fs.existsSync(entry)) {
		console.warn(`Skipping "${entry}", path does not exists`);
		return;
	}

	const crude = fs.readFileSync(entry, 'utf-8').trim();
	const match = crude.match(/---\r?\n([\s\S]+?)\r?\n---/);
	const breadcrumb = entry.split(/[/\\]/);

	const metadata = construct((match && match[1].trim()) || '');
	const sliceIdx = match ? (match.index || 0) + match[0].length + 1 : 0;
	const content = supplant(metadata, crude.slice(sliceIdx));
	if (!minimal) {
		if (!exclude.includes('toc')) metadata.toc = table(content);
		if (!exclude.includes('rt')) metadata.read_time = readTime(content);
	}
	const chunk = { frontMatter: metadata, content, breadcrumb };
	const result = !hydrate
		? ({ ...metadata, content } as FrontMatter)
		: hydrate(chunk as Parameters<typeof hydrate>[0]);

	if (!result /* hydrate is used and returns nothing */) return;

	if (!minimal && result.date && typeof result.date !== 'string' && !exclude.includes('date'))
		result.date.updated = result.date.updated || result.date.published;
	if (result.content && typeof result.content === 'string')
		result.content = structure(result.content, minimal || exclude.includes('cnt'));
	return result as Output;
}

export function traverse<
	Options extends DirOptions,
	Input extends object,
	Output extends Record<string, any> = Input
>(
	options: string | Options,
	hydrate?: HydrateFn<Options, Input, Output>,
	_types?: ParserTypes<Input, Output>
): Array<Output> {
	const { entry, recurse = !1, extensions = ['.md'], ...config } =
		typeof options !== 'string' ? options : { entry: options };

	if (!fs.existsSync(entry)) {
		console.warn(`Skipping "${entry}", path does not exists`);
		return [];
	}

	const backpack = fs.readdirSync(entry).map((name) => {
		const pathname = path.join(entry, name);
		const opts = { entry: pathname, recurse, extensions, ...config };
		if (recurse && fs.lstatSync(pathname).isDirectory()) return traverse(opts, hydrate);
		else if (extensions.some((e) => name.endsWith(e))) return compile(opts, hydrate);
		else return;
	});

	return (recurse ? backpack.flat(Number.POSITIVE_INFINITY) : backpack).filter(
		(i): i is Output => !!i && (Array.isArray(i) ? !!i.length : !!Object.keys(i).length)
	);
}
