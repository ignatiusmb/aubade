import * as fs from 'fs';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

/**
 * @template {object} [Output = import('../types.js').Metadata & { content: string }]
 * @param {string} entry
 * @returns {Output}
 */
export function compile(entry) {
	const { content, metadata } = parse(fs.readFileSync(entry, 'utf-8'));
	const result = { ...metadata, content: marker.render(content) };
	return /** @type {Output} */ (result);
}

/**
 * @template {{
 * 	entry: string;
 * 	depth?: number;
 * 	files?(path: string): boolean;
 * }} Options
 * @template {object} Output
 * @template [Transformed = Array<Output & import('../types.js').Metadata>]
 *
 * @param {Options} options
 * @param {(chunk: import('../types.js').HydrateChunk) => undefined | Output} hydrate
 * @param {(items: Array<Output & import('../types.js').Metadata>) => Transformed} [transform]
 * @returns {Transformed}
 */
export function traverse(
	{ entry, depth: level = 0, files = (v) => v.endsWith('.md') },
	hydrate,
	transform = (v) => /** @type {Transformed} */ (v),
) {
	if (!fs.existsSync(entry)) {
		console.warn(`Skipping "${entry}", path does not exists`);
		return transform([]);
	}

	/** @type {import('../types.js').HydrateChunk['siblings']} */
	const tree = fs.readdirSync(entry).map((name) => {
		const path = join(entry, name);
		return {
			/** @type {any} - discriminated union without multiple returns */
			type: fs.lstatSync(path).isDirectory() ? 'directory' : 'file',
			breadcrumb: path.split(/[/\\]/).reverse(),
			get buffer() {
				return this.type === 'file' ? fs.readFileSync(path) : void 0;
			},
		};
	});

	const backpack = tree.flatMap(({ type, breadcrumb, buffer }) => {
		const path = [...breadcrumb].reverse().join('/');
		if (type === 'file') {
			if (!files(path)) return [];
			const siblings = tree.filter(
				({ breadcrumb }) => [...breadcrumb].reverse().join('/') !== path,
			);
			return hydrate({ breadcrumb, buffer, marker, parse, siblings }) ?? [];
		} else if (level !== 0) {
			const depth = level < 0 ? level : level - 1;
			return traverse({ entry: path, depth, files }, hydrate);
		}
		return [];
	});

	return transform(/** @type {Array<Output & import('../types.js').Metadata>} */ (backpack));
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
