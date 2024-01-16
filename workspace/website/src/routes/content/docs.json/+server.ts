import * as fs from 'node:fs';
import { json } from '@sveltejs/kit';
import { traverse } from 'marqua/fs';
import { chain } from 'marqua/transform';

export const prerender = true;

export interface Schema {
	items: Array<{
		slug: string;
		title: string;
		path: string;
		content: string;
		flank?: {
			back?: { slug: string; title: string };
			next?: { slug: string; title: string };
		};
	}>;
	metadata: {
		pages: Array<{ slug: string; title: string }>;
	};
}

const ROOT = `${process.cwd()}/static/uploads`;

export async function GET() {
	const items = traverse(
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
				path: `workspace/content/${filename}`,
				content: marker.render(content),
			};
		},
		chain({
			base: '/docs/',
		}),
	);

	const metadata = {
		pages: items.map((i) => ({ slug: i.slug, title: i.title })),
	};

	return json({ items, metadata } satisfies Schema);
}
