import * as fs from 'node:fs';
import { traverse } from 'aubade/compass';
import { chain } from 'aubade/transform';

const ROOT = `${process.cwd()}/static/uploads`;

export const DATA = {
	async 'docs/'() {
		fs.mkdirSync(ROOT, { recursive: true });

		const items = await traverse('../content', ({ breadcrumb: [name] }) => {
			if (!name.endsWith('.md')) return; // skip non-md files

			return async ({ buffer, marker, parse, siblings, task }) => {
				const { body, frontmatter } = parse(buffer.toString('utf-8'));
				if (!frontmatter) return; // skip if no frontmatter

				for (const { filename, buffer } of siblings) {
					if (filename.endsWith('.md')) continue;
					task(async ({ fs }) => {
						await fs.writeFile(`${ROOT}/${filename}`, await buffer);
					});
				}

				const content = body.replace(/\.\/([^\s)]+)/g, (m, path) =>
					siblings.some(({ filename }) => filename === path) ? `/uploads/${path}` : m,
				);

				return {
					slug: name.match(/^(\d{2})-(.+).md$/)![2],
					title: frontmatter.title,
					description: frontmatter.description,
					table: frontmatter.table,
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
