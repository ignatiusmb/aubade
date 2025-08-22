<script>
	import '@fontsource-variable/brygada-1918';
	import '@fontsource-variable/inconsolata';
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
	description={page.data.meta?.description || 'markdown, orchestrated.'}
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
		:global(i[data-icon]) {
			width: 1.5rem;
			height: 1.5rem;
			display: inline-block;
			background: currentColor;
			mask: no-repeat center / 100%;
			mask-image: var(--svg);
		}
	}
</style>
