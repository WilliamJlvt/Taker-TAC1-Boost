<script lang="ts">
	import type { ScoreEntry, ExamMode } from '$lib/types.js';
	import { formatTime } from '$lib/quiz.js';
	import BuildingIcon from '@lucide/svelte/icons/building-2';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import TrophyIcon from '@lucide/svelte/icons/trophy';

	let {
		initialMode = 'organisationnel',
		currentUserId = null
	}: {
		initialMode?: Exclude<ExamMode, 'custom'>;
		currentUserId?: string | null;
	} = $props();

	let leaderboardOrga = $state<ScoreEntry[]>([]);
	let leaderboardTreso = $state<ScoreEntry[]>([]);
	let loadingOrga = $state(true);
	let loadingTreso = $state(true);
	let errorOrga = $state<string | null>(null);
	let errorTreso = $state<string | null>(null);

	// Carousel state
	let currentSlide = $state(0);

	$effect(() => {
		currentSlide = initialMode === 'tresorerie' ? 1 : 0;
	});
	let touchStartX = $state(0);
	let touchEndX = $state(0);
	let isDragging = $state(false);
	let currentTranslate = $state(0);

	async function fetchLeaderboard(mode: Exclude<ExamMode, 'custom'>) {
		if (mode === 'organisationnel') {
			loadingOrga = true;
			errorOrga = null;
		} else {
			loadingTreso = true;
			errorTreso = null;
		}

		try {
			const response = await fetch(`/api/scores?mode=${mode}`);
			if (!response.ok) throw new Error('Failed to fetch leaderboard');
			const data = await response.json();
			if (mode === 'organisationnel') {
				leaderboardOrga = data.leaderboard;
			} else {
				leaderboardTreso = data.leaderboard;
			}
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : 'Une erreur est survenue';
			if (mode === 'organisationnel') {
				errorOrga = errorMsg;
			} else {
				errorTreso = errorMsg;
			}
		} finally {
			if (mode === 'organisationnel') {
				loadingOrga = false;
			} else {
				loadingTreso = false;
			}
		}
	}

	function goToSlide(index: number) {
		currentSlide = index;
		activeMode = index === 0 ? 'organisationnel' : 'tresorerie';
		currentTranslate = 0;
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		isDragging = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		touchEndX = e.touches[0].clientX;
		const diff = touchEndX - touchStartX;
		currentTranslate = diff;
	}

	function handleTouchEnd() {
		isDragging = false;
		const diff = touchEndX - touchStartX;
		const threshold = 50;

		if (Math.abs(diff) > threshold) {
			if (diff > 0 && currentSlide > 0) {
				goToSlide(currentSlide - 1);
			} else if (diff < 0 && currentSlide < 1) {
				goToSlide(currentSlide + 1);
			} else {
				currentTranslate = 0;
			}
		} else {
			currentTranslate = 0;
		}
		touchStartX = 0;
		touchEndX = 0;
	}

	// Fetch both leaderboards on mount
	$effect(() => {
		fetchLeaderboard('organisationnel');
		fetchLeaderboard('tresorerie');
	});

	function getRankEmoji(index: number): string {
		if (index === 0) return '🥇';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return `${index + 1}`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#122555]/10">
	<!-- Carousel Tabs -->
	<div class="flex border-b border-[#122555]/10" role="tablist">
		<button
			onclick={() => goToSlide(0)}
			role="tab"
			aria-selected={currentSlide === 0}
			class="flex-1 py-4 px-6 text-center font-medium transition-all duration-200
				{currentSlide === 0
				? 'text-[#122555] border-b-2 border-[#122555] bg-[#122555]/5'
				: 'text-[#122555]/60 hover:text-[#122555] hover:bg-[#122555]/5'}"
		>
			<BuildingIcon class="w-4 h-4 inline mr-1" />
			Organisationnel
		</button>
		<button
			onclick={() => goToSlide(1)}
			role="tab"
			aria-selected={currentSlide === 1}
			class="flex-1 py-4 px-6 text-center font-medium transition-all duration-200
				{currentSlide === 1
				? 'text-[#122555] border-b-2 border-[#122555] bg-[#122555]/5'
				: 'text-[#122555]/60 hover:text-[#122555] hover:bg-[#122555]/5'}"
		>
			<WalletIcon class="w-4 h-4 inline mr-1" />
			Trésorerie
		</button>
	</div>

	<!-- Carousel Container -->
	<div
		class="overflow-hidden touch-pan-y"
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		role="region"
		aria-label="Leaderboard carousel"
	>
		<div
			class="flex transition-transform duration-300 ease-out"
			style="transform: translateX(calc(-{currentSlide * 100}% + {isDragging
				? currentTranslate
				: 0}px))"
		>
			<!-- Organisationnel Slide -->
			<div class="w-full flex-shrink-0 p-6">
				{#if loadingOrga}
					<div class="flex justify-center items-center py-12">
						<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#122555]"></div>
					</div>
				{:else if errorOrga}
					<div class="text-center py-12">
						<p class="text-red-600">{errorOrga}</p>
						<button
							onclick={() => fetchLeaderboard('organisationnel')}
							class="mt-4 px-4 py-2 bg-[#122555] text-white rounded-lg hover:bg-[#0d1a3d]"
						>
							Réessayer
						</button>
					</div>
				{:else if leaderboardOrga.length === 0}
					<div class="text-center py-12">
						<p class="text-[#122555]/60 text-lg flex items-center justify-center gap-2">
							<TrophyIcon class="w-5 h-5" /> Aucun score pour le moment
						</p>
						<p class="text-[#122555]/40 mt-2">Soyez le premier à apparaître au classement !</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each leaderboardOrga as entry, index (entry.id || index)}
							<div
								class="flex items-center gap-4 p-4 rounded-xl transition-all duration-200
									{entry.user_id === currentUserId
									? 'bg-gradient-to-r from-[#122555]/10 to-[#122555]/5 border-2 border-[#122555]/30'
									: 'bg-[#122555]/5 hover:bg-[#122555]/10'}"
							>
								<div class="w-10 text-center text-xl font-bold">{getRankEmoji(index)}</div>
								<div class="flex-shrink-0">
									{#if entry.user_image}
										<img
											src={entry.user_image}
											alt={entry.user_name}
											class="w-12 h-12 rounded-full"
										/>
									{:else}
										<div
											class="w-12 h-12 rounded-full bg-[#122555] flex items-center justify-center text-white font-bold text-lg"
										>
											{entry.user_name.charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<p class="font-semibold text-[#122555] truncate">
										{entry.user_name}
										{#if entry.user_id === currentUserId}
											<span
												class="text-xs bg-[#122555]/10 text-[#122555] px-2 py-0.5 rounded-full ml-2"
												>Vous</span
											>
										{/if}
									</p>
									<p class="text-sm text-[#122555]/60">{formatDate(entry.created_at)}</p>
								</div>
								<div class="text-right">
									<p
										class="text-2xl font-bold {entry.score >= 80
											? 'text-green-600'
											: entry.score >= 60
												? 'text-yellow-600'
												: 'text-red-600'}"
									>
										{entry.score}%
									</p>
									<p class="text-xs text-[#122555]/60">
										{entry.correct_answers}/{entry.total_questions} • {formatTime(
											Math.round(entry.time_spent)
										)} • {entry.attempt_count} essai{entry.attempt_count > 1 ? 's' : ''}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Trésorerie Slide -->
			<div class="w-full flex-shrink-0 p-6">
				{#if loadingTreso}
					<div class="flex justify-center items-center py-12">
						<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#122555]"></div>
					</div>
				{:else if errorTreso}
					<div class="text-center py-12">
						<p class="text-red-600">{errorTreso}</p>
						<button
							onclick={() => fetchLeaderboard('tresorerie')}
							class="mt-4 px-4 py-2 bg-[#122555] text-white rounded-lg hover:bg-[#0d1a3d]"
						>
							Réessayer
						</button>
					</div>
				{:else if leaderboardTreso.length === 0}
					<div class="text-center py-12">
						<p class="text-[#122555]/60 text-lg flex items-center justify-center gap-2">
							<TrophyIcon class="w-5 h-5" /> Aucun score pour le moment
						</p>
						<p class="text-[#122555]/40 mt-2">Soyez le premier à apparaître au classement !</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each leaderboardTreso as entry, index (entry.id || index)}
							<div
								class="flex items-center gap-4 p-4 rounded-xl transition-all duration-200
									{entry.user_id === currentUserId
									? 'bg-gradient-to-r from-[#122555]/10 to-[#122555]/5 border-2 border-[#122555]/30'
									: 'bg-[#122555]/5 hover:bg-[#122555]/10'}"
							>
								<div class="w-10 text-center text-xl font-bold">{getRankEmoji(index)}</div>
								<div class="flex-shrink-0">
									{#if entry.user_image}
										<img
											src={entry.user_image}
											alt={entry.user_name}
											class="w-12 h-12 rounded-full"
										/>
									{:else}
										<div
											class="w-12 h-12 rounded-full bg-[#122555] flex items-center justify-center text-white font-bold text-lg"
										>
											{entry.user_name.charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<p class="font-semibold text-[#122555] truncate">
										{entry.user_name}
										{#if entry.user_id === currentUserId}
											<span
												class="text-xs bg-[#122555]/10 text-[#122555] px-2 py-0.5 rounded-full ml-2"
												>Vous</span
											>
										{/if}
									</p>
									<p class="text-sm text-[#122555]/60">{formatDate(entry.created_at)}</p>
								</div>
								<div class="text-right">
									<p
										class="text-2xl font-bold {entry.score >= 80
											? 'text-green-600'
											: entry.score >= 60
												? 'text-yellow-600'
												: 'text-red-600'}"
									>
										{entry.score}%
									</p>
									<p class="text-xs text-[#122555]/60">
										{entry.correct_answers}/{entry.total_questions} • {formatTime(
											Math.round(entry.time_spent)
										)} • {entry.attempt_count} essai{entry.attempt_count > 1 ? 's' : ''}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Dot Indicators -->
	<div class="flex justify-center gap-2 py-4 border-t border-[#122555]/10">
		<button
			onclick={() => goToSlide(0)}
			class="w-2.5 h-2.5 rounded-full transition-all duration-200 {currentSlide === 0
				? 'bg-[#122555] w-6'
				: 'bg-[#122555]/30 hover:bg-[#122555]/50'}"
			aria-label="Aller au classement Organisationnel"
		></button>
		<button
			onclick={() => goToSlide(1)}
			class="w-2.5 h-2.5 rounded-full transition-all duration-200 {currentSlide === 1
				? 'bg-[#122555] w-6'
				: 'bg-[#122555]/30 hover:bg-[#122555]/50'}"
			aria-label="Aller au classement Trésorerie"
		></button>
	</div>

	<!-- Swipe hint for mobile -->
	<p class="text-center text-xs text-[#122555]/40 pb-4 sm:hidden">
		👆 Glissez pour changer de classement
	</p>
</div>
