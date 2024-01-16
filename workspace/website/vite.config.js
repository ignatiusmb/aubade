import * as fs from 'node:fs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
	if (command === 'build') {
		fs.mkdirSync('./static/uploads', { recursive: true });
		for (const file of fs.readdirSync('../content').filter((f) => !f.endsWith('.md'))) {
			fs.copyFileSync(`../content/${file}`, `./static/uploads/${file}`);
		}
	}

	return {
		plugins: [sveltekit()],

		server: {
			port: 3000,
		},
	};
});
