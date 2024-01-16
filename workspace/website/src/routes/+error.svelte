<script>
	import { page } from '$app/stores';
</script>

<main>
	<h1>{$page.status}</h1>
	<h2>{$page.error?.message}</h2>

	<a href="/">Click here to get back to the home page</a>
</main>

<style>
	main {
		display: grid;
		margin: 2rem auto;
		text-align: center;
	}
	h1 {
		font-size: 5rem;
	}
	a {
		margin-top: 2rem;
	}
</style>
