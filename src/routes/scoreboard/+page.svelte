<script lang="ts">
	import Scoreboard from '$lib/components/Scoreboard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import type { Session } from '@auth/core/types';
	
	let { data }: { data: { session: Session | null } } = $props();
</script>

<svelte:head>
	<title>Classement - TAC1 Boost</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="container mx-auto px-4 py-8">
		<header class="flex justify-between items-center mb-8">
			<div>
				<a href="/" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Retour
				</a>
				<h1 class="text-4xl font-bold text-gray-800 mb-2">🏆 Classement</h1>
				<p class="text-gray-600">Les meilleurs scores des examens officiels TAC1</p>
			</div>
			<UserMenu session={data.session} />
		</header>

		<div class="max-w-4xl mx-auto">
			<Scoreboard currentUserId={data.session?.user?.id} />
		</div>
	</div>
</div>
