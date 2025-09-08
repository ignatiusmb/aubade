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
		grid-template-areas: 'article';
		align-items: flex-start;
		justify-content: center;

		@media only screen and (min-width: 769px) {
			grid-template-columns: 12rem minmax(0, 80ch);
			grid-template-areas: 'nav article';
		}
		@media only screen and (min-width: 1024px) {
			grid-template-columns: 14rem minmax(0, 80ch) 14rem;
			grid-template-areas: 'nav article sidebar';
		}
	}
</style>
