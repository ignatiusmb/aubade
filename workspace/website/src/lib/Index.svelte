<script lang="ts">
	import { version } from 'marqua/package.json';
	import { page } from '$app/stores';

	export let items: Array<{ slug: string; title: string }>;
</script>

<details id="index">
	<summary>
		<span>{version}</span>
		<span>&ndash;</span>
		<a href="https://github.com/ignatiusmb/marqua/releases/v{version}">Changelog</a>
	</summary>
	<p>
		{#each items as { slug, title }, i}
			<a
				href={slug}
				data-index={`${i + 1}`.padStart(2, '0')}
				class:current={$page.url.pathname === `/docs/${slug}`}>{title}</a
			>
		{/each}
	</p>
</details>

<style>
	details {
		--radius: calc(var(--mrq-rounding));

		margin-bottom: 1rem;
		border-radius: var(--radius);
		background: rgba(255, 255, 255, 0.1);
	}
	summary {
		padding: 0.5rem 1rem;
		margin: 0;
		border: 1px solid rgba(124, 124, 124, 0.7);
		border-radius: var(--radius);
		letter-spacing: 2px;
		font-family: var(--font-monospace);
	}
	p {
		display: grid;
		margin: 0;
		font-size: 1rem;
	}
	p a {
		padding: 0.5rem 1rem;
	}
	p a[data-index]::before {
		content: attr(data-index);
		margin-right: 0.75rem;
		font-family: var(--font-monospace);
	}
	p a[data-index].current,
	p a[data-index]:hover {
		background: rgba(255, 255, 255, 0.2);
	}
	p a:last-child {
		border-bottom-right-radius: var(--radius);
		border-bottom-left-radius: var(--radius);
	}
	p a:hover {
		background: rgba(255, 255, 255, 0.1);
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
