import * as fs from 'fs/promises';
import { catenate } from 'mauss';
import { marker } from '../artisan/index.js';
import { parse } from '../core/index.js';

interface Chunk {
	buffer: Buffer;
	marker: typeof marker;
	parse: typeof parse;
	queue(task: (tools: { fs: typeof fs }) => Promise<void>): void;
	siblings: Array<{ filename: string; buffer: Promise<Buffer> }>;
}

interface Options {
	breadcrumb: string[];
	depth: number;
	parent: string;
	path: string;
	is: {
		directory: boolean;
		file: boolean;
		symlink: boolean;
	};
}

type Falsy = false | null | undefined;
interface Inspect<Output extends Record<string, any>> {
	(options: Options): Falsy | ((chunk: Chunk) => Promise<Falsy | Output>);
}
export async function traverse<Output extends Record<string, any>>(
	entry: string,
	inspect: Inspect<Output> = ({ path }) => {
		if (!path.endsWith('.md')) return;
		return async ({ buffer, parse }) => {
			const { body, metadata } = parse(buffer.toString('utf-8'));
			const result = { ...metadata, content: marker.render(body) };
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
			}

			const hydrate = inspect({
				breadcrumb: path.split(/[/\\]/).reverse(),
				depth,
				path,
				parent: current,
				is: {
					directory: item.isDirectory(),
					file: item.isFile(),
					symlink: item.isSymbolicLink(),
				},
			});

			if (hydrate) {
				const transformed = hydrate({
					buffer: await fs.readFile(path),
					marker,
					parse,
					siblings: files.filter(({ filename }) => filename !== item.name),
					queue: (task) => pending.push(task({ fs })),
				});
				results.push(transformed);
			}
		}
	}

	pending.push(scan(entry));
	await Promise.all(pending);
	const output = await Promise.all(results);
	return output.filter((i) => !!i);
}
