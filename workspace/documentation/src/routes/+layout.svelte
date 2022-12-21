<script>
	import '@ignatiusmb/styles/core.css';
	import 'marqua/styles/code.css';
	import '$lib/styles/fonts.css';

	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
</script>

<Header />

<slot />

<Footer />

<style>
	:global(body) {
		min-height: 100vh;
		display: grid;
		font-family: var(--mrq-default);
		background-color: var(--mrq-bg-light);
	}

	:global(a) {
		color: var(--mrq-primary);
	}
</style>
