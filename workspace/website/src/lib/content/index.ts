import * as fs from 'node:fs';
import { traverse } from 'marqua/fs';
import { chain } from 'marqua/transform';

const ROOT = `${process.cwd()}/static/uploads`;

export const DATA = {
	get 'docs/'() {
		return traverse(
			{ entry: '../content' },
			({ breadcrumb: [filename], buffer, marker, parse, siblings }) => {
				const { body, metadata } = parse(buffer.toString('utf-8'));

				fs.mkdirSync(ROOT, { recursive: true });
				const content = siblings.reduce((content, { type, breadcrumb: [name], buffer }) => {
					if (type !== 'file' || name.endsWith('.md')) return content;
					fs.writeFileSync(`${ROOT}/${name}`, buffer);
					return content.replace(`./${name}`, `/uploads/${name}`);
				}, body);

				return {
					slug: filename.match(/^(\d{2})-(.+).md$/)![2],
					title: metadata.title,
					table: metadata.table,
					path: `workspace/content/${filename}`,
					content: marker.render(content),
				};
			},
			chain({
				base: '/docs/',
			}),
		);
	},
};
