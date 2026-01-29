<script lang="ts">
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Sidebar from '$lib/components/ui/sidebar';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header
			class="flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 bg-background px-4"
		>
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 h-4" />
			<span class="font-medium text-sm text-muted-foreground">Administration</span>
		</header>
		<div class="flex-1 p-6 bg-gray-50/50">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
