import { traverse } from 'aubade/compass';
import { chain } from 'aubade/transform';

const ROOT = `${process.cwd()}/static/uploads`;

export const DATA = {
	async 'docs/'() {
		const items = await traverse('../content', ({ breadcrumb: [file, slug] }) => {
			if (file !== '+article.md') return;

			return async ({ buffer, marker, parse, siblings, task }) => {
				const { body, frontmatter } = parse(buffer.toString('utf-8'));
				if (!frontmatter) return;

				const content = body.replace(/\.\/([^\s)]+)/g, (m, relative) => {
					const asset = siblings.find(({ filename }) => relative === filename);
					if (!asset || !/\.(jpe?g|png|svg|mp4)$/.test(asset.filename)) return m;

					task(async ({ fs }) => {
						await fs.mkdir(ROOT, { recursive: true });
						const payload = await asset.buffer;
						const filename = `${ROOT}/${asset.filename}`;
						return fs.writeFile(filename, payload);
					});

					return `/uploads/${asset.filename}`;
				});

				return {
					slug,
					rank: frontmatter.rank,
					title: frontmatter.title,
					description: frontmatter.description,
					table: frontmatter.table,
					path: `workspace/content/${file}`,
					content: marker.render(content),
				};
			};
		});

		return chain(items, {
			sort: ({ rank: x }, { rank: y }) => Number(x) - Number(y),
			transform: ({ slug, title }) => ({ slug: '/docs/' + slug, title }),
		});
	},
};

export type Items = {
	[K in keyof typeof DATA]: Awaited<ReturnType<(typeof DATA)[K]>>;
};
