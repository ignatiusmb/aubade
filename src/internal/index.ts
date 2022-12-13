import type * as TS from './types.js';
import * as fs from 'fs';
import * as path from 'path';

import { readTime, structure, table } from './compute.js';
import { construct, supplant } from './utils.js';

export function compile<
	Options extends TS.FileOptions,
	Input extends object,
	Output extends Record<string, any> = Input
>(
	options: string | Options,
	hydrate?: TS.Hydrate<Options, Input, Output>,
	_types?: TS.ParserTypes<Input, Output>
): undefined | Output {
	const {
		entry,
		minimal = false,
		exclude = [],
	} = typeof options !== 'string' ? options : { entry: options };

	if (!fs.existsSync(entry)) {
		console.warn(`Skipping "${entry}", path does not exists`);
		return;
	}

	const crude = fs.readFileSync(entry, 'utf-8').trim();
	const match = crude.match(/---\r?\n([\s\S]+?)\r?\n---/);
	const breadcrumb = entry.split(/[/\\]/).reverse();

	const metadata = construct((match && match[1].trim()) || '');
	const sliceIdx = match ? (match.index || 0) + match[0].length + 1 : 0;
	const content = supplant(metadata, crude.slice(sliceIdx));
	if (!minimal) {
		if (!exclude.includes('toc')) metadata.toc = table(content);
		if (!exclude.includes('rt')) metadata.read_time = readTime(content);
	}
	const chunk = { frontMatter: metadata, content, breadcrumb };
	const result = !hydrate
		? ({ ...metadata, content } as TS.FrontMatter)
		: hydrate(chunk as TS.HydrateChunk<Options, Input>);

	if (!result /* hydrate is used and returns nothing */) return;

	if (!minimal && result.date && typeof result.date !== 'string' && !exclude.includes('date')) {
		result.date.updated = result.date.updated || result.date.published;
	}
	if (result.content && typeof result.content === 'string') {
		result.content = structure(result.content, minimal || exclude.includes('cnt'));
	}

	return result as Output;
}

export function traverse<
	Options extends TS.DirOptions<Output>,
	Input extends object,
	Output extends Record<string, any> = Input
>(
	options: string | Options,
	hydrate?: TS.Hydrate<Options, Input, Output>,
	_types?: TS.ParserTypes<Input, Output>
): Array<Output> {
	const {
		entry,
		recurse = false,
		extensions = ['.md'],
		sort = undefined,
		...config
	} = typeof options !== 'string' ? options : { entry: options };

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

	const items = (recurse ? backpack.flat(Number.POSITIVE_INFINITY) : backpack).filter(
		(i): i is Output => !!i && (Array.isArray(i) ? !!i.length : !!Object.keys(i).length)
	);

	return sort ? items.sort(sort) : items;
}
