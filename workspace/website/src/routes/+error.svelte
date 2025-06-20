<script>
	import { page } from '$app/state';
</script>

<div>
	<h1>{page.status}</h1>
	<h2>{page.error?.message}</h2>

	<a href="/docs/introduction">back to the docs</a>
</div>

<style>
	div {
		height: 100%;
		display: grid;
		align-content: center;
		text-align: center;
	}
	h1 {
		font-family: var(--font-monospace);
		font-size: 5rem;
	}
	a {
		margin-top: 2rem;
	}
</style>
