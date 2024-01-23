<script lang="ts">
	import { version } from 'aubade/package.json';
	import { page } from '$app/stores';

	export let items: Array<{ slug: string; title: string }>;
</script>

<details id="index">
	<summary>
		<span>{version}</span>
		<span>&ndash;</span>
		<a href="https://github.com/ignatiusmb/aubade/releases/v{version}">Changelog</a>
	</summary>
	<div>
		{#each items as { slug, title }}
			<a href={slug} class:current={$page.url.pathname === `/docs/${slug}`}>{title}</a>
		{/each}
	</div>
</details>

<style>
	details {
		--radius: calc(var(--mrq-rounding));

		z-index: 2;
		position: sticky;
		top: 1rem;
		margin-bottom: 1rem;
		border-radius: var(--radius);
		background: rgb(42, 42, 42);
	}
	summary {
		padding: 0.5rem 1rem;
		margin: 0;
		border: 1px solid rgba(124, 124, 124, 0.7);
		border-radius: var(--radius);
		letter-spacing: 2px;
		font-family: var(--font-monospace);
	}
	div {
		display: grid;
		margin: 0;
		font-size: 1rem;
	}
	div a {
		padding: 0.5rem 1rem;
	}
	div a:last-child {
		border-bottom-right-radius: var(--radius);
		border-bottom-left-radius: var(--radius);
	}
	div a.current {
		background: rgba(255, 255, 255, 0.15);
	}

	details[open] {
		border: 1px solid rgba(124, 124, 124, 0.7);
	}
	details[open] summary {
		margin-bottom: 0;
		border-width: 0;
		border-bottom-width: 1px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
	}
</style>
