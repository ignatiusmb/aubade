<script lang="ts">
	import { hydrate } from 'aubade/browser';
	import { navigating, page } from '$app/stores';
</script>

<header>
	<h1>{$page.data.title}</h1>
	<p>Aubade • Data Authoring Framework</p>
	<div class="links">
		<a href="https://github.com/ignatiusmb/aubade">
			<svg
				width="34"
				height="34"
				viewBox="0 0 24 24"
				fill="none"
				stroke="#ffffff"
				stroke-width="1.5"
			>
				<path
					d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
				/>
			</svg>
		</a>
	</div>
</header>

<main use:hydrate={$navigating}>
	<slot />
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
	.links {
		display: grid;
		gap: 0.5rem;
		grid-auto-flow: column;
		justify-content: center;
	}
	.links a {
		display: flex;
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
		.links {
			justify-content: start;
		}
	}
</style>
