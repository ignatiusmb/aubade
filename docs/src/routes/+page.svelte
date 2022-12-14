<script lang="ts">
	export let data: import('./$types').PageData;

	import { hydrate } from 'marqua/browser';
	import { Docs } from '@mauss/devtools';
	import { navigating } from '$app/stores';
	import MetaHead from './MetaHead.svelte';
</script>

<MetaHead
	title="Marqua - Code Syntax Highlighter"
	description="A markdown compiler with code syntax highlighting"
/>

<div style="display: contents" use:hydrate={$navigating}>
	<Docs repo="ignatiusmb/marqua" sections={data.docs} />
</div>
