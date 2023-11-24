import * as fs from 'fs';
import { scope } from 'mauss';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

/**
 * @template {object} Output
 * @param {string} entry
 * @param {(chunk: import('../types.js').HydrateChunk) => undefined | Output} [hydrate]
 */
export function compile(entry, hydrate) {
	const buffer = fs.readFileSync(entry);
	const result = scope(() => {
		const breadcrumb = entry.split(/[/\\]/).reverse();
		if (hydrate) return hydrate({ breadcrumb, buffer, parse });
		const { content, metadata } = parse(buffer.toString('utf-8'));
		return /** @type {import('../types.js').Metadata & { content: string }} */ ({
			...metadata,
			content,
		});
	});

	if (!result /* hydrate returns nothing */) return;
	if ('content' in result && typeof result.content === 'string') {
		result.content = marker.render(result.content);
	}

	return result;
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
	transform,
) {
	if (!fs.existsSync(entry)) {
		console.warn(`Skipping "${entry}", path does not exists`);
		return transform ? transform([]) : /** @type {Transformed} */ ([]);
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

	if (!transform) return /** @type {Transformed} */ (backpack);
	return transform(/** @type {Array<Output & import('../types.js').Metadata>} */ (backpack));

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
}
