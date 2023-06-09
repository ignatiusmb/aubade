<script lang="ts">
	import Docs from '$lib/Docs.svelte';

	export let data;
</script>

<header>
	<h1>Marqua</h1>
	<h2>Augmented Markdown Compiler</h2>

	<a href="https://github.com/ignatiusmb/marqua">
		<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5">
			<path
				d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
			/>
		</svg>
	</a>
</header>

<Docs repo="ignatiusmb/marqua" sections={data.docs} />

<style>
	header {
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;

		background: #0082c8;
		background: -webkit-linear-gradient(to right, #000046, #1cb5e0);
		background: linear-gradient(to right, #000046, #1cb5e0);
		text-align: center;
		color: white;
	}
	h1,
	h2 {
		letter-spacing: 0.1em;
	}
	h1 {
		text-transform: uppercase;
		font-size: 4rem;
		font-family: var(--font-heading);
	}
	h2 {
		margin-top: 0.75rem;
		margin-bottom: 2rem;
	}
</style>
