<script lang="ts">
	import type { Schema } from '$content/docs.json/+server';

	interface Props {
		flank: Schema['items'][number]['flank'];
	}

	let { flank }: Props = $props();
</script>

{#if flank}
	<div>
		{#if flank.back}
			<a href={flank.back.slug} style:padding-right="1rem">
				<span class="chevron">&lsaquo;</span>
				<small>Previous</small>
				<span class="title">{flank.back.title}</span>
			</a>
		{/if}
		{#if flank.next}
			<a href={flank.next.slug} style:padding-left="1rem" style:margin-left="auto">
				<span class="chevron" style:grid-column="2">&rsaquo;</span>
				<small style:text-align="right">Next</small>
				<span class="title">{flank.next.title}</span>
			</a>
		{/if}
	</div>
{/if}

<style>
	div {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
	}
	a {
		display: grid;
		gap: 0.125rem 0.5rem;
		grid-template-columns: auto auto;
		grid-template-rows: auto auto;
		align-items: center;
		padding: 0.5rem;
		border-radius: var(--rounding-base);
		text-decoration: none;

		&:focus-within,
		&:hover {
			background: var(--color-surface);
		}

		.chevron {
			grid-row: 1 / -1;
			font-size: 2rem;
		}
		:not(.title) {
			color: rgba(255, 255, 255, 0.7);
		}
	}
</style>
