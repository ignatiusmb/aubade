<script lang="ts">
	import { hydrate } from 'aubade/browser';
	import { navigating, page } from '$app/state';

	let { children } = $props();
</script>

<header>
	<h1>{page.data.title}</h1>
	<p>
		<a href="https://github.com/ignatiusmb/aubade">Aubade</a>
		<span>•</span>
		<span>Data Authoring Framework</span>
	</p>
</header>

<main use:hydrate={navigating.from}>
	{@render children()}
</main>

<style>
	header {
		max-width: 80rem;
		width: 100%;
		display: grid;
		gap: 0.875rem;
		align-items: center;
		justify-content: center;
		padding: 2rem 2rem 0;
		margin: 0 auto;
		font-size: 1.25rem;
		text-align: center;
	}
	h1 {
		font-size: 4rem;
	}

	main {
		display: grid;
		gap: 2rem;
		grid-template-columns: minmax(0, 1fr);
		align-items: flex-start;
		justify-content: center;
		padding: 0 2rem;
		margin: 3rem auto;
	}

	@media only screen and (min-width: 769px) {
		header {
			justify-content: start;
			padding: 2rem 1rem 0;
			text-align: left;
		}
		main {
			padding: 0 1rem;
			grid-template-columns: minmax(12rem, 16rem) minmax(0, 60rem);
		}
	}
</style>
