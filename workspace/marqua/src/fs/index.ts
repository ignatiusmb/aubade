import type * as TS from '../types.js';
import * as fs from 'fs';

import { compile } from '../core/index.js';

export function traverse<
	Options extends TS.DirOptions<Output>,
	Input extends object,
	Output extends Record<string, any> = Input
>(options: string | Options, hydrate?: TS.Hydrate<Input, Output>): Output[] {
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
		const pathname = join(entry, name);
		if (recurse && fs.lstatSync(pathname).isDirectory()) {
			const opts = { entry: pathname, recurse, extensions, ...config };
			return traverse(opts, hydrate);
		}
		if (extensions.some((e) => name.endsWith(e))) {
			return compile(fs.readFileSync(pathname, 'utf-8'), hydrate);
		}
		return;
	});

	const items = (recurse ? backpack.flat(Number.POSITIVE_INFINITY) : backpack).filter(
		(i): i is Output => !!(i && (Array.isArray(i) ? i : Object.keys(i)).length)
	);

	return sort ? items.sort(sort) : items;

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
