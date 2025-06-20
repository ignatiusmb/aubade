<script lang="ts">
	import { page } from '$app/state';
</script>

<header>
	<h1>{page.data.title}</h1>
	<p>
		<a href="https://github.com/ignatiusmb/aubade">Aubade</a>
		<span>•</span>
		<span>filesystem-based content processor</span>
	</p>
</header>

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

		@media only screen and (min-width: 769px) {
			justify-content: start;
			padding: 2rem 1rem 0;
			text-align: left;
		}

		h1 {
			font-size: 4rem;
		}
	}
</style>
