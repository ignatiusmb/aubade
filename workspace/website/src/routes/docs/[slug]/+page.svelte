<script lang="ts">
	import Divider from '$lib/Divider.svelte';
	import Edit from '$lib/Edit.svelte';
	import Index from '$lib/Index.svelte';
	import Flank from './Flank.svelte';

	import { version } from 'aubade/package.json';
	import { page } from '$app/state';

	let { data } = $props();
</script>

<nav>
	<span
		style:padding="0.25rem 1rem"
		style:margin-top="1rem"
		style:font-size="1.25rem"
		style:font-family="var(--font-mono)"
	>
		aubade@<a href="https://github.com/ignatiusmb/aubade/releases/latest">{version}</a>
	</span>

	<Divider type="horizontal" />

	<ul>
		{#each data.pages as { slug, title }}
			{@const current = page.url.pathname.endsWith(slug)}
			<li><a href="/docs/{slug}" class:current>{title}</a></li>
		{/each}
	</ul>
</nav>

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

<aside style:margin-top="1rem">
	<label>
		<input type="checkbox" style:display="none" />
		<strong>on this page</strong>
	</label>
	<ul>
		<li><a href="/docs/{data.slug}">{data.title}</a></li>
		{#each data.table as { id, title, level }}
			{@const indent = `${(level - 2) * 0.5}rem`}
			<li><a href="#{id}" style:margin-left={indent}>{title}</a></li>
		{/each}
	</ul>
</aside>

<style>
	nav {
		display: none;

		position: sticky;
		top: 0;
		gap: 0.25rem;
		align-content: flex-start;

		ul {
			list-style: none;
			display: grid;
			gap: 0.25rem;

			a {
				width: 100%;
				display: flex;
				padding: 0.25rem 0.375rem 0.25rem 1rem;
				border-radius: 0.5rem;
				line-height: 2;

				&.current {
					background: rgba(255, 255, 255, 0.1);
				}
				&:hover {
					background: rgba(255, 255, 255, 0.15);
				}
			}
		}
	}

	article {
		footer {
			margin-top: 2rem;
		}
	}

	aside {
		position: sticky;
		top: 1rem;
		display: none;
		gap: 0.5rem;

		ul {
			list-style: none;
			line-height: 1.5;
		}

		@media (min-width: 1024px) {
			display: grid;
		}
	}

	/* ---- @html content ---- */
	article :global {
		[id] {
			scroll-margin-top: 1.5rem;
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
		table {
			width: 100%;
			margin-top: 1rem;
			border-collapse: collapse;
			line-height: 1.3;
			font-size: calc(var(--size-base) * 0.89);

			thead {
				background: var(--stone-800);
				color: var(--stone-400);
				font-weight: 500;
			}

			td,
			th {
				padding: 0.5rem;
				border-bottom: 1px solid var(--stone-700);
				text-align: left;
			}
		}

		[data-aubade='block'] {
			margin: 1rem 0 1.5rem;
		}
	}

	@media (min-width: 769px) {
		nav {
			max-height: 100dvh;
			display: grid;
		}
		article > :global(#index) {
			display: none;
		}
	}
</style>
