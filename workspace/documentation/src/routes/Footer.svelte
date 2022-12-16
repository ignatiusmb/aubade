<footer>
	<p>
		<span>Copyright &copy;</span>
		<a href="https://mauss.dev/">Ignatius Bagussuputra</a>
		<span>2019 &ndash; {new Date().getFullYear()}</span>
	</p>
	<p>
		<span>Documentation made with &#x2764; using</span>
		<a href="https://kit.svelte.dev/">SvelteKit</a>
		<span>&plus;</span>
		<a href="https://github.com/ignatiusmb/marqua/">Marqua</a>
	</p>
</footer>

<style>
	footer {
		width: 100%;
		max-width: 84rem;
		position: relative;
		display: grid;
		gap: 0.5rem;
		padding: 3rem 2rem;
		margin: 0 auto;
		text-align: center;
		font-family: var(--font-monospace);
		font-size: clamp(0.8rem, 3vw, 1rem);
	}
</style>
