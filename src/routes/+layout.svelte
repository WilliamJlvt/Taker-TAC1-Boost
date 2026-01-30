<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { afterNavigate } from '$app/navigation';
	import { resetQuizState } from '$lib/stores.js';

	let { children } = $props();

	// Reset quiz state on every navigation to prevent stale state
	afterNavigate((navigation) => {
		// Only reset if navigating TO a different page (not initial load)
		if (navigation.from && navigation.to?.url.pathname !== navigation.from.url.pathname) {
			resetQuizState();
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
