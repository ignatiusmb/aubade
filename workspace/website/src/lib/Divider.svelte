<script lang="ts">
	interface Props {
		type: 'horizontal' | 'vertical';
		spacing?: string;
		weight?: string;
	}

	let { type, spacing = '0', weight = '2px' }: Props = $props();
</script>

<div style:--weight={weight} style:--spacing={spacing} class="divider {type}"></div>

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
