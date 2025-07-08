import * as fs from 'fs/promises';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

interface Chunk {
	buffer: Buffer;
	marker: typeof marker;
	parse: typeof parse;
	siblings: Array<{ filename: string; buffer: Promise<Buffer> }>;
	/** register an async task to be executed in parallel with the traversal. */
	task(fn: (tools: { fs: typeof fs }) => Promise<void>): void;
}

interface Options {
	breadcrumb: string[];
	depth: number;
	parent: string;
	path: string;
}

type Falsy = false | null | undefined;
interface Inspect<Output extends Record<string, any>> {
	(options: Options): Falsy | ((chunk: Chunk) => Promise<Falsy | Output>);
}
export async function orchestrate<Output extends Record<string, any>>(
	entry: string,
	inspect: Inspect<Output> = ({ path }) => {
		if (!path.endsWith('.md')) return;
		return async ({ buffer, parse }) => {
			const { body, frontmatter } = parse(buffer.toString('utf-8'));
			if (!frontmatter) return;
			const result = { ...frontmatter, content: marker.render(body).trim() };
			return result as any;
		};
	},
): Promise<Output[]> {
	const results: Promise<Falsy | Output>[] = [];
	const pending: Promise<void>[] = [];

	async function scan(current: string, { depth = 0 } = {}) {
		const tree = await fs.readdir(current, { withFileTypes: true });
		const files = tree.flatMap((i) => {
			if (i.isDirectory()) return [];
			return {
				filename: i.name,
				get buffer() {
					return fs.readFile(catenate(current, i.name));
				},
			};
		});

		for (const item of tree) {
			const path = catenate(current, item.name);
			if (item.isDirectory()) {
				pending.push(scan(path, { depth: depth + 1 }));
				continue;
			}

			const hydrate = inspect({
				breadcrumb: path.split(/[/\\]/).reverse(),
				depth,
				path,
				parent: current,
			});

			if (hydrate) {
				const transformed = hydrate({
					buffer: await fs.readFile(path),
					marker,
					parse: parse,
					siblings: files.filter(({ filename }) => filename !== item.name),
					task: (fn) => pending.push(fn({ fs })),
				});
				results.push(transformed);
			}
		}
	}

	await scan(entry); // await for the initial scan to complete
	while (pending.length) await Promise.all(pending.splice(0));
	return (await Promise.all(results)).filter((i) => !!i);
}

function catenate(...paths: string[]): string {
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
