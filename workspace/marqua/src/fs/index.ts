import type { MarquaTable } from '../types.js';
import * as fs from 'fs';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

interface FrontMatter {
	date: {
		published: string | Date;
		updated?: string | Date;
	};

	//----> computed properties
	estimate: number;
	table: MarquaTable[];
}

interface Compiled extends FrontMatter {
	content: string;
}

interface HydrateChunk {
	breadcrumb: string[];
	content: string;
	frontMatter: FrontMatter & Record<string, any>;
}

export function compile(entry: string): Compiled;
export function compile<Output extends object>(
	entry: string,
	hydrate?: (chunk: HydrateChunk) => undefined | Output
): undefined | Output;
export function compile<Output extends object>(
	entry: string,
	hydrate?: (chunk: HydrateChunk) => undefined | Output
) {
	const crude = fs.readFileSync(entry, 'utf-8').trim();
	const { content: source, metadata } = parse(crude);
	const breadcrumb = entry.split(/[/\\]/).reverse();
	const result = !hydrate
		? ({ ...metadata, content: source } as Compiled)
		: hydrate({ breadcrumb, content: source, frontMatter: metadata as any });

	if (!result /* hydrate returns nothing */) return;
	if ('date' in result && result.date && typeof result.date !== 'string') {
		result.date.updated = result.date.updated || result.date.published;
	}
	if ('content' in result && typeof result.content === 'string') {
		result.content = marker.render(result.content);
	}

	return result;
}

export function traverse<
	Options extends { entry: string; extensions?: string[]; depth?: number },
	Output extends object,
	Transformed = Array<Output & FrontMatter>
>(
	{ entry, extensions = ['.md'], depth = 0 }: Options,
	hydrate?: (chunk: HydrateChunk) => undefined | Output,
	transform?: (items: Array<Output & FrontMatter>) => Transformed
): Transformed {
	if (!fs.existsSync(entry)) {
		console.warn(`Skipping "${entry}", path does not exists`);
		return transform ? transform([]) : ([] as Transformed);
	}

	const backpack = fs.readdirSync(entry).flatMap((name) => {
		const pathname = join(entry, name);
		if (depth !== 0 && fs.lstatSync(pathname).isDirectory()) {
			depth = depth < 0 ? depth : depth - 1;
			return traverse({ entry: pathname, extensions, depth }, hydrate);
		}
		if (extensions.some((e) => name.endsWith(e))) {
			const data = compile(pathname, hydrate);
			const keys = Object.keys(data || {});
			return data && keys.length ? [data] : [];
		}
		return [];
	});

	if (!transform) return backpack as Transformed;
	return transform(backpack as Array<Output & FrontMatter>);

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
