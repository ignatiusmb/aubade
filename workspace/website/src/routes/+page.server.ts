import { redirect } from '@sveltejs/kit';

export async function load() {
	redirect(307, '/docs/introduction');

	return {
		meta: {
			title: 'Data Authoring Framework',
			description: 'A framework to manage your static content',
		},
	};
}
