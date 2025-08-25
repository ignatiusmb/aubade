<script lang="ts">
	import { hydrate } from 'aubade/browser';
	import { navigating } from '$app/state';
	let { children } = $props();
</script>

<div {@attach hydrate(navigating.from)}>
	{@render children()}
</div>

<style>
	div {
		display: grid;
		gap: 2rem;
		grid-template-columns: minmax(0, 1fr);
		align-items: flex-start;
		justify-content: center;

		@media only screen and (min-width: 769px) {
			grid-template-columns: 12rem minmax(0, 80ch);
		}
		@media only screen and (min-width: 1024px) {
			grid-template-columns: 14rem minmax(0, 80ch) 14rem;
		}
	}
</style>
