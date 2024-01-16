<script lang="ts">
	export let repo: string;
	export let path: string;
</script>

<a href="https://github.com/{repo}/blob/master/{path}">
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
	>
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
	</svg>

	<slot />
</a>

<style>
	a {
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: inherit;
		font-size: 0.875rem;
	}
</style>
