<script>
	import '@fontsource-variable/crimson-pro';
	import '@fontsource-variable/fira-code';
	import '@ignatiusmb/styles/core.css';
	import 'aubade/styles/code.css';
	import '../app.css';

	import MetaHead from 'syv/core/MetaHead.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	import { dev } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	const { children } = $props();

	afterNavigate(() => {
		// @ts-expect-error - update vercel insights more accurately
		window.va?.('pageview', { route: page.route.id, url: page.url.pathname });
	});
</script>

<MetaHead
	domain="https://aubade.mauss.dev"
	title="{page.data.meta?.title || page.status} • Aubade"
	canonical={page.data.meta?.canonical || '/'}
	description={page.data.meta?.description || 'filesystem-based content processor'}
	authors={['Ignatius Bagus.']}
	og={{
		site_name: 'Aubade',
		title: page.data.meta?.title || `${page.status}`,
		description: page.data.meta?.description,
	}}
	scripts={{
		'/_vercel/insights/script.js': !dev && { 'data-disable-auto-track': '1' },
		'/_vercel/speed-insights/script.js': !dev && { 'data-route': page.route.id },
	}}
/>

<main>
	{#if !page.error}
		<Header />
	{/if}

	{@render children()}

	{#if !page.error}
		<Footer />
	{/if}
</main>

<style>
	main {
		height: 100%;

		:global(i[data-icon]) {
			width: 1.5rem;
			height: 1.5rem;
			display: inline-block;
			background: currentColor;
			mask: no-repeat center / 100%;
			mask-image: var(--svg);

			&[data-icon='copyright'] {
				width: 1rem;
				height: 1rem;
				--svg: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"><circle cx="128" cy="128" r="96"/><path d="M160,152a40,40,0,1,1,0-48"/></svg>');
			}
		}
	}
</style>
