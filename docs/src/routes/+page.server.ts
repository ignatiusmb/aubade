import { traverse } from 'marqua';

export const load: import('./$types').PageServerLoad = async () => {
	const docs = traverse('content', ({ frontMatter, content, breadcrumb: [filename] }) => {
		if (filename.includes('draft')) return;
		const path = `docs/content/${filename}.md`;
		const [, index, slug] = filename.match(/(\d{2})-(\w+).md/) || [];
		return { index, slug, ...frontMatter, content, path };
	});

	return { docs };
};
