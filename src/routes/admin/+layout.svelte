<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children } = $props();
</script>

<Sidebar.Provider style="--sidebar-width: 20rem">
	<AppSidebar variant="inset" collapsible="icon" />
	<Sidebar.Inset>
		<SiteHeader />
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
