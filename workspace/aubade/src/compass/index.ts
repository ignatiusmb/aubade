import type { DirChunk, FileChunk, HydrateChunk, Metadata } from '../types.js';
import * as fs from 'fs';
import { catenate } from 'mauss';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

export function visit<T extends Record<string, any>>(
	entry: string,
): T & Metadata & { content: string } {
	const { body, metadata } = parse(fs.readFileSync(entry, 'utf-8'));
	const result = { ...metadata, content: marker.render(body) };
	return result as any;
}

/**
 * @template {'all' | 'files' | 'directories'} T
 * @param {T} type
 * @param {string} entry
 * @returns {T extends 'all'
 * 		? import('../types.js').HydrateChunk['siblings'] : T extends 'files'
 * 		? import('../types.js').FileChunk[] : import('../types.js').DirChunk[]}
 */
export function scan<T extends 'all' | 'files' | 'directories'>(
	type: T,
	entry: string,
): T extends 'all' ? HydrateChunk['siblings'] : T extends 'files' ? FileChunk[] : DirChunk[] {
	const entries: HydrateChunk['siblings'] = [];
	for (const name of fs.statSync(entry).isDirectory() ? fs.readdirSync(entry) : []) {
		const path = catenate(entry, name);
		// trick TS to enable discriminated union
		const stat: any = fs.statSync(path).isDirectory() ? 'directory' : 'file';
		if (type === 'files' && stat === 'directory') continue;
		if (type === 'directories' && stat === 'file') continue;
		entries.push({
			type: stat,
			path,
			breadcrumb: path.split(/[/\\]/).reverse(),
			get buffer() {
				return stat === 'file' ? fs.readFileSync(path) : void 0;
			},
		});
	}
	return entries as any;
}

export function traverse(entry: string, { depth: level = 0 } = {}) {
	const entries = scan('files', entry);
	for (const { path } of level ? scan('directories', entry) : []) {
		entries.push(...traverse(path, { depth: level - 1 }).files);
	}

	return {
		files: entries,

		/** hydrate `files` scanned on to the shelf with the `load` function. */
		hydrate<T>(
			load: (chunk: HydrateChunk) => undefined | T,
			files = (v: string) => v.endsWith('.md'),
		): T[] {
			const items = [];
			for (const { path, breadcrumb, buffer } of entries) {
				if (!files(path)) continue;
				const item = load({
					breadcrumb,
					buffer,
					marker,
					parse,
					get siblings() {
						const parent = breadcrumb.slice(1).reverse();
						const tree = scan('all', parent.join('/'));
						return tree.filter(({ path: file }) => file !== path);
					},
				});
				item && items.push(item);
			}
			return items;
		},
	};
}
