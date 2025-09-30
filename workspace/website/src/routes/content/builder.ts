import { orchestrate } from 'aubade/conductor';
import { codeblock } from 'aubade/palette';
import { chain } from 'aubade/transform';

const ROOT = `${process.cwd()}/static/uploads`;

export const DATA = {
	async 'docs/'() {
		const items = await orchestrate('../content', ({ breadcrumb: [file, slug] }) => {
			if (file !== '+article.md') return;

			return async ({ assemble, buffer, siblings, task }) => {
				const { doc, manifest, meta } = assemble(buffer.toString('utf-8'));

				function materialize(source: string): string {
					const asset = siblings.find(({ filename }) => source.endsWith(filename));
					if (!asset || !/\.(jpe?g|png|svg|mp4)$/.test(asset.filename)) return source;
					task(async ({ fs }) => {
						await fs.mkdir(ROOT, { recursive: true });
						const payload = await asset.buffer;
						const filename = `${ROOT}/${asset.filename}`;
						return fs.writeFile(filename, payload);
					});
					return `/uploads/${asset.filename}`;
				}

				doc.tokens = doc.visit({
					'aubade:directive'(token) {
						if (token.meta.type !== 'video') return token;
						const { src } = token.meta.data;
						token.meta.data.src = materialize(src);
						return token;
					},
					'block:image'(token) {
						const { src } = token.attr;
						token.attr.src = materialize(src);
						return token;
					},
					'inline:image'(token) {
						const { src } = token.attr;
						token.attr.src = materialize(src);
						return token;
					},
				});

				return {
					slug,
					rank: manifest.rank,
					title: manifest.title,
					description: manifest.description,
					table: meta.table,
					path: `workspace/content/${file}`,
					content: doc.html({ 'block:code': codeblock }),
				};
			};
		});

		return chain(items, {
			sorter() {
				return ({ rank: x }, { rank: y }) => Number(x) - Number(y);
			},
			transform: ({ slug, title }) => ({ slug: '/docs/' + slug, title }),
		});
	},
};

export type Items = {
	[K in keyof typeof DATA]: Awaited<ReturnType<(typeof DATA)[K]>>;
};
