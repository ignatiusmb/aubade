import * as fs from 'fs';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

/**
 * @template {object} Output
 * @param {string} entry
 * @returns {Output & import('../types.js').Metadata & { content: string }}
 */
export function visit(entry) {
	const { body, metadata } = parse(fs.readFileSync(entry, 'utf-8'));
	const result = { ...metadata, content: marker.render(body) };
	return /** @type {any} */ (result);
}

/**
 * @param {string} entry
 * @param {{
 * 	depth?: number;
 * 	files?(path: string): boolean;
 * }} [options]
 */
export function traverse(entry, { depth: level = 0, files = (v) => v.endsWith('.md') } = {}) {
	/** @type {import('../types.js').HydrateChunk['siblings']} */
	const tree = fs.readdirSync(entry).map((name) => {
		const path = join(entry, name);
		return {
			/** @type {any} - trick TS to enable discriminated union */
			type: fs.statSync(path).isDirectory() ? 'directory' : 'file',
			breadcrumb: path.split(/[/\\]/).reverse(),
			get buffer() {
				return this.type === 'file' ? fs.readFileSync(path) : void 0;
			},
		};
	});

	return {
		/**
		 * @template {object} Output
		 * @template Transformed
		 *
		 * @param {(chunk: import('../types.js').HydrateChunk) => undefined | Output} load
		 * @param {(items: Output[]) => Transformed} [transform]
		 * @returns {Transformed}
		 */
		hydrate(load, transform = (v) => /** @type {Transformed} */ (v)) {
			const backpack = tree.flatMap(({ type, breadcrumb, buffer }) => {
				const path = [...breadcrumb].reverse().join('/');
				if (type === 'file') {
					if (!files(path)) return [];
					const siblings = tree.filter(({ breadcrumb: [name] }) => name !== breadcrumb[0]);
					return load({ breadcrumb, buffer, marker, parse, siblings }) ?? [];
				} else if (level !== 0) {
					const depth = level < 0 ? level : level - 1;
					return traverse(path, { depth, files }).hydrate(load);
				}
				return [];
			});

			return transform(/** @type {any} */ (backpack));
		},
	};
}

/**
 * adapted from https://github.com/alchemauss/mauss/pull/153
 * @param {string[]} paths
 */
function join(...paths) {
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
