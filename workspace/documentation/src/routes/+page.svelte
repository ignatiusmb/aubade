<script lang="ts">
	export let data: import('./$types').PageData;

	import Docs from '$lib/Docs.svelte';
	import MetaHead from './MetaHead.svelte';
</script>

<MetaHead
	title="Code Syntax Highlighter"
	description="A markdown compiler with code syntax highlighting"
/>

<Docs repo="ignatiusmb/marqua" sections={data.docs} />
