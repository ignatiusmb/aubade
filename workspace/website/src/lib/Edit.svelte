<script lang="ts">
	interface Props {
		repo: string;
		path: string;
		children: import('svelte').Snippet;
	}

	let { repo, path, children }: Props = $props();
</script>

<a href="https://github.com/{repo}/blob/master/{path}">
	<svg
		viewBox="0 0 256 256"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	>
		<circle cx="128" cy="128" r="96" />
		<path d="M176,211.16V176a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v35.16" />
		<path d="M96,168V144a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v24" />
		<path d="M147.84,136l-12-57.63c-1.77-8.49-13.89-8.49-15.66,0l-12,57.63" />
	</svg>

	{@render children()}
</a>

<style>
	a {
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: inherit;
		font-size: 0.875rem;

		svg {
			width: 1.25rem;
			height: 1.25rem;
		}
	}
</style>
