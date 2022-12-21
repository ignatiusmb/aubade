import { traverse } from 'marqua/fs';

export const prerender = true;

export const load: import('./$types').PageServerLoad = async () => {
	const docs = traverse(
		{ entry: '../../content' },
		({ frontMatter: { title, ...rest }, content, breadcrumb: [filename] }) => {
			if (filename.includes('draft')) return;
			const path = `content/${filename}`;
			const [, index, slug] = filename.match(/^(\d{2})-(.+).md$/) || [];
			return { index, slug, title, ...rest, content, path };
		}
	);

	return { docs };
};
