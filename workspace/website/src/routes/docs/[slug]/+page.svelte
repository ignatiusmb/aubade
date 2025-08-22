<script lang="ts">
	import Divider from '$lib/Divider.svelte';
	import Edit from '$lib/Edit.svelte';
	import Index from '$lib/Index.svelte';
	import Flank from './Flank.svelte';

	import { version } from 'aubade/package.json';
	import { page } from '$app/state';

	let { data } = $props();
</script>

<aside>
	<a
		href="https://github.com/ignatiusmb/aubade/releases/latest"
		style:margin-bottom="0.5rem"
		style:letter-spacing="2px"
		style:font-size="1.25rem"
		style:font-family="var(--font-mono)"
		data-prefix="v"
	>
		{version}
	</a>

	{#each data.pages as { slug, title }}
		<a href="/docs/{slug}" class:current={page.url.pathname === `/docs/${slug}`}>
			{title}
		</a>
	{/each}

	<Divider type="horizontal" spacing="0.5rem" />

	{#each data.table as { id, title, level }}
		{@const indent = `${(level - 2) * 0.5}rem`}
		<a href="#{id}" style:margin-left={indent}>{title}</a>
	{/each}
</aside>

<article>
	<Index items={data.pages} />

	{@html data.content}

	<footer>
		<Edit repo="ignatiusmb/aubade" path={data.path}>
			<span>suggest changes</span>
		</Edit>

		<Divider type="horizontal" spacing="0.5rem" />

		<Flank flank={data.flank} />
	</footer>
</article>

<style>
	aside {
		display: none;

		position: sticky;
		top: 0;
		gap: 0.25rem;
		align-content: flex-start;

		a {
			padding: 0.25rem 0.375rem 0.25rem 1rem;
			border-radius: 0.5rem;
			line-height: 2;

			&[data-prefix]::before {
				content: attr(data-prefix);
				margin: 0 0.75rem 0 0.25rem;
			}
			&.current {
				background: rgba(255, 255, 255, 0.1);
			}
			&:hover {
				background: rgba(255, 255, 255, 0.15);
			}
		}
	}

	footer {
		margin-top: 2rem;
	}

	/* ---- @html content ---- */
	article :global {
		[id] {
			scroll-margin-top: 2rem;
		}
		h2,
		h3 {
			display: grid;
			gap: 0.75rem;
			align-items: center;
			margin-top: 1.5rem;
			font-size: 1.5rem;
		}
		h2 {
			position: relative;
			margin-top: 2rem;
			font-size: 2rem;
			font-weight: 500;
		}
		h3 {
			margin-top: 1.5rem;
			font-size: 1.5rem;
			font-weight: 500;
		}
		p,
		li {
			line-height: 1.65;
		}
		p:not(:first-child) {
			margin-top: 1rem;
		}
		ul {
			padding-inline-start: 1.25rem;
			margin: 0;
			margin-block-start: 1rem;

			li:not(:first-child) {
				margin-top: 0.25rem;
			}
		}
		blockquote {
			padding: 1rem;
			margin: 1rem 0;
			border-left: 0.25rem solid var(--aubade-primary);
			background: rgba(0, 112, 187, 0.1);
		}
		[data-aubade='block'] {
			margin: 1rem 0 1.5rem;
		}
	}

	@media (min-width: 769px) {
		aside {
			display: grid;
		}
		article > :global(#index) {
			display: none;
		}
		aside,
		article {
			padding-top: 1rem;
		}
	}
</style>
