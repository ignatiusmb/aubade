<script>
	import '@fontsource/rubik/400.css';
	import '@fontsource/rubik/500.css';
	import '@fontsource/karla/400.css';
	import '@fontsource/karla/600.css';
	import '@fontsource/fira-code/400.css';

	import '@ignatiusmb/styles/core.css';
	import 'marqua/styles/code.css';
	import '../app.css';

	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.meta?.title || `Error ${$page.status}`} • Marqua</title>
	<meta name="author" content="ignatiusmb" />

	{#if $page.data.meta?.description}
		<meta name="description" content={$page.data.meta.description} />
	{/if}

	<meta property="og:site_name" content="Marqua" />
	<meta property="og:locale" content="en_ID" />

	{#if $page.data.meta?.og}
		{@const { title, url, description } = $page.data.meta.og}
		<meta property="og:title" content={title} />
		<meta property="og:type" content="article" />
		{#if url}
			<meta property="og:url" content={url} />
		{/if}
		{#if description}
			<meta property="og:description" content={description} />
		{/if}
	{/if}
</svelte:head>

<slot />

<footer>
	<p>
		<span>Copyright &copy;</span>
		<a href="https://mauss.dev">Ignatius Bagussuputra</a>
		<span>2019 &ndash; {new Date().getFullYear()}</span>
	</p>
	<p>
		<span>Documentation made with</span>
		<span style:color="var(--mrq-primary)">&#x2764;</span>
		<span>using</span>
		<a href="https://github.com/sveltejs/kit">SvelteKit</a>
		<span>&plus;</span>
		<a href="https://github.com/ignatiusmb/marqua">Marqua</a>
	</p>
</footer>

<style>
	footer {
		width: 100%;
		max-width: 84ch;
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
