<script lang="ts">
	import logo from '$lib/assets/logo.svg';
	import ProfileView from '$lib/components/ProfileView.svelte';

	let { data } = $props();
	const stats = $derived(data.stats);
	const session = $derived(data.session);
	const user = $derived(session?.user);
</script>

<svelte:head>
	<title>Mon Profil - TAC1 Boost</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-white via-slate-50 to-[#122555]/5">
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<!-- Header -->
		<header class="flex justify-between items-center mb-8">
			<a href="/" class="flex items-center gap-3">
				<img src={logo} alt="TAC1 Boost" class="h-10 w-auto" />
			</a>
			<a
				href="/"
				class="flex items-center gap-2 text-[#122555]/70 hover:text-[#122555] transition-colors"
			>
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
		</header>

		<ProfileView {user} {stats} />
	</div>
</div>
