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

<div>
	{#if !page.error}
		<Header />
	{/if}

	<main>
		{@render children()}
	</main>

	{#if !page.error}
		<Footer />
	{/if}
</div>

<style>
	div {
		--max-content: 80rem;
		--breakout: calc((calc(var(--max-content) + 12rem) - var(--max-content)) / 2);
		--pad: 1rem;

		display: grid;
		gap: var(--pad) 0;
		align-content: center;
		grid-template-rows: [top-start] auto [content-start] 1fr [content-end] auto [top-end];
		grid-template-columns:
			[full-bleed-start] var(--pad)
			[full-bleed-padding-start] minmax(0, 1fr)
			[breakout-start] minmax(0, var(--breakout))
			[content-start] min(100% - var(--pad) * 2, var(--max-content))
			[content-end] minmax(0, var(--breakout))
			[breakout-end] minmax(0, 1fr)
			[full-bleed-padding-end] var(--pad)
			[full-bleed-end];

		> main {
			grid-row: content;
			grid-column: content;
		}

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
