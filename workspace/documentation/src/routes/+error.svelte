<script>
	import { page } from '$app/stores';
</script>

<h1 style:margin="2rem" style:text-align="center">
	{$page.status}: {$page.error?.message}
</h1>
