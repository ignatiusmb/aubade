import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { GET } from './src/routes/docs/content.json/+server';

export default defineConfig(({ command }) => {
	if (command === 'build') {
		GET(); // generate static assets
	}

	return {
		plugins: [sveltekit()],

		server: {
			port: 3000,
		},
	};
});
