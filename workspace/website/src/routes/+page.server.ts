import type Docs from '$lib/Docs.svelte';
import type { ComponentProps } from 'svelte';
import { traverse } from 'marqua/fs';

export const prerender = true;

export const load: import('./$types').PageServerLoad = async () => {
	const docs: ComponentProps<Docs>['sections'] = traverse(
		{ entry: '../content' },
		({ breadcrumb: [filename], buffer, marker, parse }) => {
			const path = `workspace/content/${filename}`;
			const slug = filename.match(/^(\d{2})-(.+).md$/)![2];
			const { content, metadata } = parse(buffer.toString('utf-8'));
			return { slug, title: metadata.title, path, content: marker.render(content) };
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
