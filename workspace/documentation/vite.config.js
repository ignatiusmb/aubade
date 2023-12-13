import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],

	// build: {
	// 	rollupOptions: {
	// 		external: ['marqua/fs'],
	// 	},
	// },

	server: {
		port: 3000,
	},

	// ssr: {
	// 	external: ['markdown-it'],
	// },
});
