<script lang="ts">
	import { version } from 'aubade/package.json';
	import { page } from '$app/state';

	interface Props {
		items: Array<{ slug: string; title: string }>;
	}

	let { items }: Props = $props();
</script>

<details id="index">
	<summary>
		<i data-icon="duotone-caret-right"></i>
		<span>aubade@<a href="https://github.com/ignatiusmb/aubade/releases/latest">{version}</a></span>
	</summary>
	<div>
		{#each items as { slug, title }}
			<a href={slug} class:current={page.url.pathname === `/docs/${slug}`}>{title}</a>
		{/each}
	</div>
</details>

<style>
	details {
		--radius: calc(var(--aubade-rounding));

		z-index: 2;
		position: sticky;
		top: 1rem;
		margin-bottom: 1rem;
		border-radius: var(--radius);
		background: rgb(42, 42, 42);

		&[open] {
			border: 1px solid rgba(124, 124, 124, 0.7);

			summary {
				margin-bottom: 0;
				border-width: 0;
				border-bottom-width: 1px;
				border-bottom-right-radius: 0;
				border-bottom-left-radius: 0;

				i[data-icon] {
					transform: rotate(90deg);
				}
			}
		}
	}
	summary {
		list-style: none;
		cursor: pointer;
		user-select: none;

		display: grid;
		gap: 0.5rem;
		align-items: center;
		justify-content: start;
		grid-template-columns: auto auto;

		padding: 0.5rem 1rem;
		margin: 0;
		border: 1px solid rgba(124, 124, 124, 0.7);
		border-radius: var(--radius);
		font-family: var(--font-mono);
	}
	div {
		display: grid;
		margin: 0;
		font-size: 1rem;

		a {
			padding: 0.5rem 1rem;

			&:last-child {
				border-bottom-right-radius: var(--radius);
				border-bottom-left-radius: var(--radius);
			}
			&.current {
				background: rgba(255, 255, 255, 0.15);
			}
		}
	}

	i[data-icon='duotone-caret-right'] {
		transition: 100ms ease-out;
		--svg: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><polygon points="96 48 176 128 96 208 96 48" opacity="0.2"/><polygon points="96 48 176 128 96 208 96 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>');
	}
</style>
