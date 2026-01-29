<script lang="ts">
	import Scoreboard from '$lib/components/Scoreboard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import type { Session } from '@auth/core/types';
	import TrophyIcon from '@lucide/svelte/icons/trophy';

	let { data }: { data: { session: Session | null } } = $props();
</script>

<svelte:head>
	<title>Classement - TAC1 Boost</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-white via-slate-50 to-[#122555]/5">
	<div class="container mx-auto px-4 py-8">
		<header class="flex justify-between items-center mb-8">
			<div>
				<a href="/" class="text-[#122555] hover:text-[#122555]/70 flex items-center gap-2 mb-4">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Retour
				</a>
				<h1 class="text-4xl font-bold text-[#122555] mb-2 flex items-center gap-3">
					<TrophyIcon class="w-8 h-8" />
					Classement
				</h1>
				<p class="text-[#122555]/60">Les meilleurs scores des examens officiels TAC1</p>
			</div>
			<UserMenu session={data.session} />
		</header>

		<div class="max-w-4xl mx-auto">
			<Scoreboard currentUserId={data.session?.user?.id} />
		</div>
	</div>
</div>
