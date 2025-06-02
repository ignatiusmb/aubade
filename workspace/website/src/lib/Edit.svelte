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
		<polygon points="128 160 96 160 96 128 192 32 224 64 128 160" />
		<line x1="168" y1="56" x2="200" y2="88" />
		<path d="M216,128v80a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8h80" />
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
