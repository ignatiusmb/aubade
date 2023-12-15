import * as fs from 'fs';
import { scope } from 'mauss';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

/**
 * @template {object} [Output = import('../types.js').Metadata & { content: string }]
 * @param {string} entry
 * @param {(chunk: import('../types.js').HydrateChunk) => undefined | Output} [hydrate]
 * @returns {undefined | Output}
 */
export function compile(entry, hydrate) {
	const buffer = fs.readFileSync(entry);
	const result = scope(() => {
		if (hydrate) {
			const breadcrumb = entry.split(/[/\\]/).reverse();
			const dirname = breadcrumb.slice(1).reverse().join('/');
			/** @type {import('../types.js').HydrateChunk['siblings']} */
			const tree = fs.readdirSync(dirname).map((name) => {
				const path = join(dirname, name);
				if (fs.lstatSync(path).isDirectory()) {
					return { type: 'directory', name, path };
				}
				return { type: 'file', name, path, buffer };
			});
			return hydrate({ breadcrumb, buffer, parse, siblings: tree });
		}
		const { content, metadata } = parse(buffer.toString('utf-8'));
		return { ...metadata, content };
	});

	if (!result /* hydrate returns nothing */) return;
	if ('content' in result && typeof result.content === 'string') {
		result.content = marker.render(result.content);
	}

	return /** @type {Output} */ (result);
}

/**
 * @template {{
 * 	entry: string;
 * 	compile?(path: string): boolean;
 * 	depth?: number;
 * }} Options
 * @template {object} Output
 * @template [Transformed = Array<Output & import('../types.js').Metadata>]
 *
 * @param {Options} options
 * @param {(chunk: import('../types.js').HydrateChunk) => undefined | Output} [hydrate]
 * @param {(items: Array<Output & import('../types.js').Metadata>) => Transformed} [transform]
 * @returns {Transformed}
 */
export function traverse(
	{ entry, compile: fn = (v) => v.endsWith('.md'), depth: level = 0 },
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
		if (fs.lstatSync(path).isDirectory()) {
			return { type: 'directory', name, path };
		}
		const buffer = fs.readFileSync(path);
		return { type: 'file', name, path, buffer };
	});

	const backpack = tree.flatMap(({ type, path, buffer }) => {
		if (type === 'file') {
			const data = fn(path) && compile(path, hydrate);
			if (data && Object.keys(data).length) return data;
			if (!hydrate) return []; // skip this file
			const breadcrumb = path.split(/[/\\]/).reverse();
			return hydrate({ breadcrumb, buffer, parse, siblings: tree });
		} else if (level !== 0) {
			const depth = level < 0 ? level : level - 1;
			const options = { entry: path, depth, compile: fn };
			return traverse(options, hydrate);
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
