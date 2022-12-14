<script>
	import { version } from 'marqua/package.json';
	import { Link } from 'syv';
	import { Github } from 'syv/icons/feather';
</script>

<header>
	<h1>Marqua</h1>
	<h3>Version v{version}</h3>
	<Link href="https://github.com/ignatiusmb/marqua">
		<Github size={34} />
	</Link>
</header>

<style>
	header {
		height: 100vh;
		display: grid;
		gap: 1em;
		align-content: center;
		justify-content: center;
		background: #0082c8;
		background: -webkit-linear-gradient(to right, #000046, #1cb5e0);
		background: linear-gradient(to right, #000046, #1cb5e0);
		text-align: center;
		color: white;
	}
	h1 {
		font-size: 4rem;
		font-family: var(--mrq-heading);
	}
	h3 {
		font-size: 1.5rem;
		font-family: var(--mrq-monospace);
	}

	header > :global(.syv-core-link) {
		color: inherit;
	}
</style>
