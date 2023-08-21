import type { MarquaTable } from '../types.js';
import * as fs from 'fs';
import { scope } from 'mauss';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

interface Metadata {
	//----> computed properties
	estimate: number;
	table: MarquaTable[];
}

interface HydrateChunk {
	breadcrumb: string[];
	buffer: Buffer;
	parse: typeof parse;
}

export function compile(entry: string): Metadata & { content: string };
export function compile<Output extends object>(
	entry: string,
	hydrate?: (chunk: HydrateChunk) => undefined | Output,
): undefined | Output;
export function compile<Output extends object>(
	entry: string,
	hydrate?: (chunk: HydrateChunk) => undefined | Output,
) {
	const buffer = fs.readFileSync(entry);
	const result = scope(() => {
		const breadcrumb = entry.split(/[/\\]/).reverse();
		if (hydrate) return hydrate({ breadcrumb, buffer, parse });
		const { content, metadata } = parse(buffer.toString('utf-8'));
		return { ...metadata, content } as Metadata & { content: string };
	});

	if (!result /* hydrate returns nothing */) return;
	if ('content' in result && typeof result.content === 'string') {
		result.content = marker.render(result.content);
	}

	return result;
}

export function traverse<
	Options extends {
		entry: string;
		compile?(path: string): boolean;
		depth?: number;
	},
	Output extends object,
	Transformed = Array<Output & Metadata>,
>(
	{ entry, compile: fn = (v) => v.endsWith('.md'), depth: level = 0 }: Options,
	hydrate?: (chunk: HydrateChunk) => undefined | Output,
	transform?: (items: Array<Output & Metadata>) => Transformed,
): Transformed {
	if (!fs.existsSync(entry)) {
		console.warn(`Skipping "${entry}", path does not exists`);
		return transform ? transform([]) : ([] as Transformed);
	}

	const backpack = fs.readdirSync(entry).flatMap((name) => {
		const pathname = join(entry, name);
		if (level !== 0 && fs.lstatSync(pathname).isDirectory()) {
			const depth = level < 0 ? level : level - 1;
			const options = { entry: pathname, depth, compile: fn };
			return traverse(options, hydrate);
		}

		const data = scope(() => {
			if (fn(pathname)) return compile(pathname, hydrate);
			if (!hydrate) return; // no need to do anything else
			const breadcrumb = pathname.split(/[/\\]/).reverse();
			const buffer = fs.readFileSync(pathname);
			return hydrate({ breadcrumb, buffer, parse });
		});
		return data && Object.keys(data).length ? [data] : [];
	});

	if (!transform) return backpack as Transformed;
	return transform(backpack as Array<Output & Metadata>);

	// adapted from https://github.com/alchemauss/mauss/pull/153
	function join(...paths: string[]) {
		if (!paths.length) return '.';
		const index = paths[0].replace(/\\/g, '/').trim();
		if (paths.length === 1 && index === '') return '.';
		const parts = index.replace(/[/]*$/g, '').split('/');
		if (parts[0] === '') parts.shift();

		for (let i = 1; i < paths.length; i += 1) {
			const part = paths[i].replace(/\\/g, '/').trim();
			for (const slice of part.split('/')) {
				if (slice === '.') continue;
				if (slice === '..') parts.pop();
				else if (slice) parts.push(slice);
			}
		}

		return (index[0] === '/' ? '/' : '') + parts.join('/');
	}
}
