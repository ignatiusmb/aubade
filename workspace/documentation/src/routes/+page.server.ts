import type Docs from '$lib/Docs.svelte';
import type { ComponentProps } from 'svelte';
import { traverse } from 'marqua/fs';

export const prerender = true;

export const load: import('./$types').PageServerLoad = async () => {
	const docs: ComponentProps<Docs>['sections'] = traverse(
		{ entry: '../../content' },
		({ breadcrumb: [filename], buffer, parse }) => {
			const path = `content/${filename}`;
			const [, index, slug] = filename.match(/^(\d{2})-(.+).md$/)!;
			const { content, metadata } = parse(buffer.toString('utf-8'));
			return { index, slug, title: metadata.title, path, content };
		},
	);

	return {
		docs,
		meta: {
			title: 'Augmented Markdown Compiler',
			description: 'A markdown compiler with code syntax highlighting',
		},
	};
};
