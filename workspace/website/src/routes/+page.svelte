<script lang="ts">
	import Docs from '$lib/Docs.svelte';

	export let data;

	const repo = 'ignatiusmb/marqua';
</script>

<header>
	<div>
		<h1>Marqua</h1>
		<p>Augmented Markdown Compiler</p>
	</div>

	<aside>
		<a href="https://github.com/{repo}">
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
	</aside>
</header>

<Docs {repo} sections={data.docs} />

<style>
	header {
		max-width: 80rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 2rem 0;
		margin: 0 auto;
		font-family: 'Karla';
		font-size: 1.25rem;
		text-align: center;
	}
	header aside {
		margin-top: 2rem;
	}
	h1 {
		margin-bottom: 1rem;
		font-size: 4rem;
	}

	@media only screen and (min-width: 480px) {
		header {
			flex-direction: row;
			justify-content: space-between;
			text-align: left;
		}
		header aside {
			margin-top: unset;
		}
	}
	@media only screen and (min-width: 769px) {
		header {
			padding: 2rem 1rem 0;
		}
	}
</style>
