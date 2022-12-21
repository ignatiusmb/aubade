import type * as TS from './types.js';
import * as fs from 'fs';
import * as path from 'path';

import { exists } from 'mauss/guards';
import { readTime, structure, table } from './compute.js';

export function parse(source: string) {
	const match = source.match(/---\r?\n([\s\S]+?)\r?\n---/);
	const trimmed = (match && match[1].trim()) || '';
	const metadata: Record<string, any> = {};

	for (const line of trimmed.split(/\r?\n/).filter(exists)) {
		const match = line.trim().match(/([:\w\d]+): (.+)/);
		if (!match || (match && !match[2].trim())) continue;

		const [key, data] = match.slice(1).map((g) => g.trim());
		if (/:/.test(key)) {
			const [parent, ...rest] = key.split(':');
			metadata[parent] = nest(data, rest);
			continue;
		}

		metadata[key] = data; // else -> standard assignment
	}

	const start = match ? (match.index || 0) + match[0].length + 1 : 0;
	return {
		metadata,
		content: inject(source.slice(start), metadata),
	};

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
}

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

	const breadcrumb = entry.split(/[/\\]/).reverse();
	const crude = fs.readFileSync(entry, 'utf-8').trim();
	const { metadata, content } = parse(crude);

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
): Output[] {
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
		return;
	});

	const items = (recurse ? backpack.flat(Number.POSITIVE_INFINITY) : backpack).filter(
		(i): i is Output => !!(i && (Array.isArray(i) ? i : Object.keys(i)).length)
	);

	return sort ? items.sort(sort) : items;
}
