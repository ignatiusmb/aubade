<script lang="ts">
	import Divider from '$lib/Divider.svelte';
	import Edit from '$lib/Edit.svelte';
	import Index from '$lib/Index.svelte';
	import Flank from './Flank.svelte';

	import { version } from 'aubade/package.json';
	import { page } from '$app/state';

	let { data } = $props();
</script>

<nav style:grid-area="nav">
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

<aside style:grid-area="sidebar">
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

<article style:grid-area="article">
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
					background: var(--color-surface);
				}
				&:hover {
					background: var(--color-overlay);
				}
			}
		}

		a {
			text-decoration: none;
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
		margin-top: 1rem;

		ul {
			list-style: none;
			line-height: 1.5;
		}

		a {
			text-decoration: none;
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
		ol,
		ul {
			padding-inline-start: 1.25rem;
			margin: 0;
			margin-block-start: 1rem;

			li:not(:first-child) {
				margin-top: 0.25rem;
			}

			li > ol,
			li > ul {
				margin-block-start: 0.25rem;
			}
		}
		blockquote {
			padding: 1rem;
			margin: 1rem 0;
			border-radius: calc(var(--rounding-base) / 2);
			border-left: 0.25rem solid var(--aubade-accent);
			background: color-mix(in oklch, var(--aubade-accent) 34%, black);
		}
		table {
			width: 100%;
			margin-top: 1rem;
			border-collapse: collapse;
			line-height: 1.3;
			font-size: calc(var(--size-base) * 0.89);

			thead {
				background: var(--color-surface);
				color: var(--color-text-muted);
				font-weight: 500;
			}

			td,
			th {
				padding: 0.5rem;
				border-bottom: 1px solid var(--color-border);
				text-align: left;
			}
			td {
				vertical-align: top;
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
