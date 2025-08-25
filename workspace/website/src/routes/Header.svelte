<script lang="ts">
	import { page } from '$app/state';
</script>

<header>
	<h1>{page.data.title}</h1>
	<p>
		<a href="https://github.com/ignatiusmb/aubade">Aubade</a>
		<span>•</span>
		<span>markdown, orchestrated.</span>
	</p>
</header>

<style>
	header {
		grid-column: content;
		width: 100%;

		display: grid;
		gap: 0.875rem;
		align-items: center;
		justify-content: center;

		padding-top: calc(var(--pad) * 2);
		font-size: 1.25rem;
		text-align: center;

		@media only screen and (min-width: 769px) {
			justify-content: start;
			padding-left: 1rem;
			text-align: left;
		}

		h1 {
			font-size: 4rem;
		}
	}
</style>
