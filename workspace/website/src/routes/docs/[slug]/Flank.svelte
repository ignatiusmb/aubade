<script lang="ts">
	import type { Schema } from '$content/docs.json/+server';
	export let flank: Schema['items'][number]['flank'];
</script>

{#if flank}
	<div>
		{#if flank.back}
			<a href={flank.back.slug}>
				<span class="chevron">&lsaquo;</span>
				<small>Previous</small>
				<span class="title">{flank.back.title}</span>
			</a>
		{/if}
		{#if flank.next}
			<a href={flank.next.slug} style:margin-left="auto">
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
	}
	a .chevron {
		grid-row: 1 / -1;
		font-size: 2rem;
	}
	a :not(.title) {
		color: rgba(255, 255, 255, 0.7);
	}
</style>
