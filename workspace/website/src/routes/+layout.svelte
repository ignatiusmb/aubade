<script>
	import '@fontsource-variable/karla';
	import '@fontsource-variable/fira-code';
	import '@ignatiusmb/styles/core.css';
	import 'aubade/styles/code.css';
	import '../app.css';

	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.meta?.title || `Error ${$page.status}`} • Aubade</title>
	<meta name="author" content="ignatiusmb" />

	{#if $page.data.meta?.description}
		<meta name="description" content={$page.data.meta.description} />
	{/if}

	<meta property="og:site_name" content="Aubade" />
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
		<span>&Larr;</span>
		<a href="https://github.com/ignatiusmb/aubade">Aubade</a>
		<span style:color="var(--mrq-primary)">&#x2764;</span>
		<a href="https://github.com/sveltejs/kit">SvelteKit</a>
		<span>&Rarr;</span>
	</p>
	<p>
		<span>&copy; 2019&ndash;{new Date().getFullYear()}</span>
		<a href="https://mauss.dev">Ignatius Bagussuputra</a>
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
		font-size: 0.875rem;
	}
</style>
