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
		padding: 0 2rem;
		margin: 3rem auto 0;

		@media only screen and (min-width: 769px) {
			padding: 0 1rem;
			grid-template-columns: minmax(12rem, 16rem) minmax(0, 60rem);
		}
	}
</style>
