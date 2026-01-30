<script lang="ts">
	import ProfileView from '$lib/components/ProfileView.svelte';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import type { PageData } from './$types';

	let { data } = $props();
	const user = data.viewedUser;
	const stats = data.stats;
</script>

<div class="space-y-6 mt-8">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/admin/users" class="rounded-full">
			<ChevronLeft class="h-5 w-5" />
		</Button>
		<h2 class="text-2xl font-bold text-[#122555]">Profil de {user.name}</h2>
	</div>

	<ProfileView {user} {stats} isAdminView={true} />
</div>
