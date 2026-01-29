<script lang="ts">
	import { page } from '$app/stores';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import FileQuestionIcon from '@lucide/svelte/icons/file-question';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	
	let { children } = $props();

	const links = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon },
		{ href: '/admin/questions', label: 'Questions', icon: FileQuestionIcon },
		{ href: '/admin/categories', label: 'Catégories', icon: FolderOpenIcon },
		{ href: '/admin/import', label: 'Import JSON', icon: UploadIcon }
	];
</script>

<div class="min-h-screen bg-gray-50 flex">
	<!-- Sidebar -->
	<aside class="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm fixed h-full z-10">
		<div class="p-6 border-b border-gray-100">
			<h1 class="font-bold text-xl text-[#122555] flex items-center gap-2">
				<span class="bg-[#122555] text-white p-1 rounded">TB</span>
				Admin
			</h1>
		</div>
		
		<nav class="flex-1 p-4 space-y-2">
			{#each links as link}
				<a 
					href={link.href}
					class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
					{$page.url.pathname === link.href 
						? 'bg-[#122555]/10 text-[#122555] translate-x-1' 
						: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
				>
					<link.icon class="w-5 h-5" />
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="p-4 border-t border-gray-100">
			<a href="/" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-[#122555] transition-colors rounded-lg hover:bg-[#122555]/5">
				<ArrowLeftIcon class="w-5 h-5" />
				Retour au site
			</a>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 md:ml-64 p-8">
		{@render children?.()}
	</main>
</div>
