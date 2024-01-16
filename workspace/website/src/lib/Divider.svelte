<script lang="ts">
	export let type: 'horizontal' | 'vertical';
	export let spacing = '0';
	export let weight = '2px';
</script>

<div style:--weight={weight} style:--spacing={spacing} class="divider {type}" />

<style>
	div {
		padding: 0;
		background: var(--mrq-primary);
	}
	.horizontal {
		width: 100%;
		height: var(--weight);
		margin: var(--spacing) 0;
	}
	.vertical {
		width: var(--weight);
		height: 100%;
		margin: 0 var(--spacing);
	}
</style>
