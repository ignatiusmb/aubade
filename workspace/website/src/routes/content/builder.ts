import { orchestrate } from 'aubade/conductor';
import { marker } from 'aubade/legacy';
import { chain } from 'aubade/transform';

const ROOT = `${process.cwd()}/static/uploads`;

export const DATA = {
	async 'docs/'() {
		const items = await orchestrate('../content', ({ breadcrumb: [file, slug] }) => {
			if (file !== '+article.md') return;

			return async ({ assemble, buffer, siblings, task }) => {
				const { manifest, meta } = assemble(buffer.toString('utf-8'));

				const content = meta.body.replace(/\.\/([^\s)]+)/g, (m, relative) => {
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
					rank: manifest.rank,
					title: manifest.title,
					description: manifest.description,
					table: meta.table,
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
