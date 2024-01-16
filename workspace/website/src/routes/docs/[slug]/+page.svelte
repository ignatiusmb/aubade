<script lang="ts">
	import Divider from '$lib/Divider.svelte';
	import Index from '$lib/Index.svelte';
	import Flank from './Flank.svelte';

	import { version } from 'marqua/package.json';
	import { page } from '$app/stores';

	export let data;
</script>

<aside>
	<a
		href="https://github.com/ignatiusmb/marqua/releases/v{version}"
		style:margin-bottom="0.5rem"
		style:letter-spacing="2px"
		style:font-size="1.25rem"
		style:font-family="var(--font-monospace)"
		data-prefix="v"
	>
		{version}
	</a>

	{#each data.pages as { slug, title }, i}
		<a
			href="/docs/{slug}"
			data-index={`${i + 1}`.padStart(2, '0')}
			class:current={$page.url.pathname === `/docs/${slug}`}
		>
			{title}
		</a>
	{/each}
</aside>

<article>
	<Index items={data.pages} />

	{@html data.content}

	<Divider type="horizontal" spacing="1rem" />

	<Flank flank={data.flank} />
</article>

<style>
	aside {
		display: none;

		position: sticky;
		top: 0;
		gap: 0.25rem;
		align-content: flex-start;
	}
	aside a {
		padding-left: 1rem;
		border-radius: 0.5rem;
		line-height: 4ch;
	}
	aside a[data-prefix]::before {
		content: attr(data-prefix);
		margin: 0 0.75rem 0 0.25rem;
	}
	aside a[data-index]::before {
		content: attr(data-index);
		margin-right: 0.75rem;
		font-family: var(--font-monospace);
	}
	aside a[data-index].current,
	aside a[data-index]:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	/* ---- @html content ---- */
	article > :global([id]) {
		scroll-margin-top: 2rem;
	}
	article > :global(h2),
	article > :global(h3) {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: auto 1fr;
		align-items: center;
		margin-top: 1.5rem;
		font-size: 1.5rem;
	}
	article > :global(h2) {
		position: relative;
		grid-template-columns: 1.25rem auto 1fr;
		margin: 2rem 0 1.5rem;
		font-size: 2rem;
		font-weight: 500;
	}
	article > :global(h3) {
		grid-template-columns: auto 1fr;
		margin-top: 1.5rem;
		font-size: 1.5rem;
		font-weight: 500;
	}
	article > :global(h2::before) {
		content: '';
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		margin-left: 0.25rem;
		box-shadow: 0 0 0 0.25rem rgba(0, 112, 187, 0.6);
		background: var(--mrq-primary);
	}
	article > :global(h2::after),
	article > :global(h3::after) {
		content: '';
		width: 100%;
		height: 0.15rem;
		background: rgba(0, 112, 187, 0.6);
	}
	article > :global(p) {
		line-height: 1.5;
	}
	article > :global(p:not(:first-child)) {
		margin-top: 1rem;
	}
	article > :global(ul li:not(:first-child)) {
		margin-top: 0.5rem;
	}
	article :global(.mrq[data-mrq='block']) {
		margin: 1rem 0 1.5rem;
	}

	@media only screen and (min-width: 769px) {
		aside {
			display: grid;
		}
		article > :global(#index) {
			display: none;
		}
	}
</style>
