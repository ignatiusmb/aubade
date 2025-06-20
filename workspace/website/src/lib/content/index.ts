import * as fs from 'node:fs';
import { traverse } from 'aubade/compass';
import { chain } from 'aubade/transform';

const ROOT = `${process.cwd()}/static/uploads`;

export const DATA = {
	async 'docs/'() {
		fs.mkdirSync(ROOT, { recursive: true });

		const items = await traverse('../content', ({ breadcrumb: [name] }) => {
			if (!name.endsWith('.md')) return; // skip non-md files

			return async ({ buffer, marker, parse, siblings, queue }) => {
				const { body, metadata } = parse(buffer.toString('utf-8'));
				if (!metadata) return; // skip if no metadata

				for (const { filename, buffer } of siblings) {
					if (filename.endsWith('.md')) continue;
					queue(async ({ fs }) => {
						fs.writeFile(`${ROOT}/${filename}`, await buffer);
					});
				}

				const content = body.replace(/\.\.?\/*([\w.-]+\.\w+)/g, (m, path) =>
					siblings.some(({ filename }) => filename === path) ? `/uploads/${path}` : m,
				);

				return {
					slug: name.match(/^(\d{2})-(.+).md$/)![2],
					title: metadata.title,
					description: metadata.description,
					table: metadata.table,
					path: `workspace/content/${name}`,
					content: marker.render(content),
				};
			};
		});

		return chain(items, {
			transform: ({ slug, title }) => ({ slug: '/docs/' + slug, title }),
		});
	},
};

export type Items = {
	[K in keyof typeof DATA]: Awaited<ReturnType<(typeof DATA)[K]>>;
};
