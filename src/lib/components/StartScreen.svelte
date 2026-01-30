<script lang="ts">
	import type { Question, ExamMode } from '$lib/types.js';
	import { EXAM_MODES } from '$lib/types.js';
	import { signIn } from '@auth/sveltekit/client';
	import type { Session } from '@auth/core/types';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import BuildingIcon from '@lucide/svelte/icons/building-2';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import TruckIcon from '@lucide/svelte/icons/truck';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import TargetIcon from '@lucide/svelte/icons/target';
	import DumbbellIcon from '@lucide/svelte/icons/dumbbell';
	import StarIcon from '@lucide/svelte/icons/star';

	let {
		startQuiz,
		session,
		questions
	}: {
		startQuiz: (
			questionCount: number,
			timeLimit: number,
			categories: Question['category'][],
			examMode?: ExamMode
		) => void;
		session: Session | null;
		questions: Question[];
	} = $props();

	let totalQuestions = $derived(questions.length);
	let clrCount = $derived(questions.filter((q) => q.category === 'CLR').length);
	let mouvementCount = $derived(questions.filter((q) => q.category === 'Mouvement').length);
	let organisationnelCount = $derived(
		questions.filter((q) => q.category === 'Organisationnel').length
	);
	let tresorerieCount = $derived(questions.filter((q) => q.category === 'Trésorerie').length);

	let questionCount = $state(10);
	let timeLimit = $state(3);

	let selectedCategories = $state<Question['category'][]>(['CLR', 'Mouvement', 'Organisationnel', 'Trésorerie']);

	// Carousel state: 0 = official, 1 = training
	let activeMode = $state(0);
	let isDragging = $state(false);
	let startX = $state(0);
	let currentTranslate = $state(0);

	const presets = [
		{ name: 'Rapide', questions: 10, time: 3, icon: '⚡', color: 'from-[#122555]/70 to-[#122555]' },
		{ name: 'Moyen', questions: 25, time: 10, icon: '🎯', color: 'from-[#122555]/80 to-[#122555]' },
		{ name: 'Long', questions: 50, time: 25, icon: '💪', color: 'from-[#122555]/90 to-[#122555]' },
		{
			name: 'Complet',
			questions: 100,
			time: 60,
			icon: '🏆',
			color: 'from-[#122555] to-[#0d1a3d]'
		}
	];

	let showCustom = $state(false);

	function selectPreset(preset: (typeof presets)[0]) {
		questionCount = preset.questions;
		timeLimit = preset.time;
		showCustom = false;
	}

	function toggleCategory(category: Question['category']) {
		if (selectedCategories.includes(category)) {
			if (selectedCategories.length > 1) {
				selectedCategories = selectedCategories.filter((c) => c !== category);
			}
		} else {
			selectedCategories = [...selectedCategories, category];
		}
	}

	function handleStart() {
		startQuiz(questionCount, timeLimit, selectedCategories, 'custom');
	}

	function startOfficialMode(mode: Exclude<ExamMode, 'custom'>) {
		if (!session) {
			signIn('google');
			return;
		}
		const config = EXAM_MODES[mode];
		startQuiz(config.questionCount, config.timeLimit, config.categories, mode);
	}

	function switchMode(index: number) {
		activeMode = index;
	}

	// Touch/drag handling for carousel
	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		startX = e.touches[0].clientX;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		const currentX = e.touches[0].clientX;
		const diff = currentX - startX;
		currentTranslate = diff;
	}

	function handleTouchEnd() {
		isDragging = false;
		if (Math.abs(currentTranslate) > 50) {
			if (currentTranslate > 0 && activeMode > 0) {
				activeMode--;
			} else if (currentTranslate < 0 && activeMode < 1) {
				activeMode++;
			}
		}
		currentTranslate = 0;
	}
</script>

<div class="max-w-2xl mx-auto space-y-3">
	<!-- Mode Selector Tabs -->
	<div class="flex justify-center">
		<div class="inline-flex bg-[#122555]/10 rounded-2xl p-1.5 shadow-inner">
			<button
				onclick={() => switchMode(0)}
				class="relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 {activeMode ===
				0
					? 'bg-white text-gray-800 shadow-lg'
					: 'text-gray-500 hover:text-gray-700'}"
			>
				<span class="flex items-center gap-2"> <TrophyIcon class="w-4 h-4" /> Mode Officiel </span>
				{#if activeMode === 0}
					<div
						class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#122555] rounded-full"
					></div>
				{/if}
			</button>
			<button
				onclick={() => switchMode(1)}
				class="relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 {activeMode ===
				1
					? 'bg-white text-gray-800 shadow-lg'
					: 'text-gray-500 hover:text-gray-700'}"
			>
				<span class="flex items-center gap-2"> <SettingsIcon class="w-4 h-4" /> Entraînement </span>
				{#if activeMode === 1}
					<div
						class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#122555]/50 rounded-full"
					></div>
				{/if}
			</button>
		</div>
	</div>

	<!-- Carousel Container -->
	<div
		class="overflow-hidden rounded-2xl"
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		<div
			class="flex transition-transform duration-500 ease-out"
			style="transform: translateX(calc(-{activeMode * 100}% + {currentTranslate}px))"
		>
			<!-- Slide 1: Official Mode -->
			<div class="w-full flex-shrink-0 px-1">
				<div class="bg-white rounded-2xl shadow-xl p-6 animate-fade-in border border-[#122555]/10">
					<div class="text-center mb-4">
						<div
							class="inline-flex items-center justify-center w-12 h-12 bg-[#122555] rounded-xl mb-3 shadow-lg"
						>
							<TrophyIcon class="w-6 h-6 text-white" />
						</div>
						<h2 class="text-xl font-bold text-[#122555] mb-1">Modes Officiels</h2>
						<p class="text-[#122555]/60 text-xs">Scores enregistrés dans le classement</p>
					</div>

					{#if !session}
						<div
							class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3"
						>
							<div
								class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"
							>
								<svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
										clip-rule="evenodd"
									></path>
								</svg>
							</div>
							<div>
								<p class="text-amber-800 font-medium text-sm">Connexion requise</p>
								<p class="text-amber-600 text-xs">
									Connectez-vous pour accéder aux examens officiels
								</p>
							</div>
						</div>
					{/if}

					<div class="space-y-4">
						<button
							onclick={() => startOfficialMode('organisationnelle')}
							class="w-full group relative p-5 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden
								{session
								? 'border-[#122555]/20 bg-gradient-to-br from-[#122555]/5 to-[#122555]/10 hover:border-[#122555]/40 hover:shadow-xl hover:-translate-y-1'
								: 'border-gray-200 bg-gray-50 opacity-60 cursor-pointer'}"
						>
							<div
								class="absolute top-0 right-0 w-32 h-32 bg-[#122555]/10 rounded-full -translate-y-1/2 translate-x-1/2"
							></div>
							<div class="relative flex items-center gap-4">
								<div
									class="w-14 h-14 rounded-xl bg-[#122555] flex items-center justify-center text-white text-2xl shadow-lg {!session
										? 'opacity-50'
										: 'group-hover:scale-110 transition-transform'}"
								>
									<BuildingIcon class="w-7 h-7" />
								</div>
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<h3 class="font-bold text-lg {session ? 'text-[#122555]' : 'text-gray-500'}">
											TAC1 Organisationnel
										</h3>
										{#if session}
											<span
												class="text-xs bg-[#122555]/10 text-[#122555] px-2 py-0.5 rounded-full font-medium"
												>⭐ Classé</span
											>
										{/if}
									</div>
									<p class="text-sm text-[#122555]/60 mb-2">
										{EXAM_MODES.organisationnelle.description}
									</p>
									<div class="flex items-center gap-3 text-xs">
										<span
											class="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-gray-600 font-medium shadow-sm"
											>{EXAM_MODES.organisationnelle.questionCount} questions</span
										>
										<span
											class="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-gray-600 font-medium shadow-sm"
											>{EXAM_MODES.organisationnelle.timeLimit} min</span
										>
									</div>
								</div>
								<svg
									class="w-6 h-6 text-[#122555]/30 group-hover:text-[#122555] group-hover:translate-x-1 transition-all"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									></path>
								</svg>
							</div>
						</button>

						<!-- TAC1 Trésorerie -->
						<button
							onclick={() => startOfficialMode('tresorerie')}
							class="w-full group relative p-5 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden
								{session
								? 'border-[#122555]/20 bg-gradient-to-br from-[#122555]/5 to-[#122555]/10 hover:border-[#122555]/40 hover:shadow-xl hover:-translate-y-1'
								: 'border-gray-200 bg-gray-50 opacity-60 cursor-pointer'}"
						>
							<div
								class="absolute top-0 right-0 w-32 h-32 bg-[#122555]/10 rounded-full -translate-y-1/2 translate-x-1/2"
							></div>
							<div class="relative flex items-center gap-4">
								<div
									class="w-14 h-14 rounded-xl bg-[#122555] flex items-center justify-center text-white text-2xl shadow-lg {!session
										? 'opacity-50'
										: 'group-hover:scale-110 transition-transform'}"
								>
									<WalletIcon class="w-7 h-7" />
								</div>
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<h3 class="font-bold text-lg {session ? 'text-[#122555]' : 'text-gray-500'}">
											TAC1 Trésorerie
										</h3>
										{#if session}
											<span
												class="text-xs bg-[#122555]/10 text-[#122555] px-2 py-0.5 rounded-full font-medium"
												>⭐ Classé</span
											>
										{/if}
									</div>
									<p class="text-sm text-[#122555]/60 mb-2">{EXAM_MODES.tresorerie.description}</p>
									<div class="flex items-center gap-3 text-xs">
										<span
											class="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-gray-600 font-medium shadow-sm"
											>{EXAM_MODES.tresorerie.questionCount} questions</span
										>
										<span
											class="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-gray-600 font-medium shadow-sm"
											>{EXAM_MODES.tresorerie.timeLimit} min</span
										>
									</div>
								</div>
								<svg
									class="w-6 h-6 text-[#122555]/30 group-hover:text-[#122555] group-hover:translate-x-1 transition-all"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									></path>
								</svg>
							</div>
						</button>
					</div>

					<!-- Link to Scoreboard -->
					<div class="text-center mt-4 pt-4 border-t border-[#122555]/10">
						<a
							href="/scoreboard"
							class="inline-flex items-center gap-2 text-[#122555] hover:text-[#122555]/80 font-medium transition-colors"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							Voir le classement
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>

			<div class="w-full flex-shrink-0 px-1">
				<div class="bg-white rounded-2xl shadow-xl p-6 animate-fade-in border border-[#122555]/10">
					<div class="text-center mb-4">
						<div
							class="inline-flex items-center justify-center w-12 h-12 bg-[#122555] rounded-xl mb-3 shadow-lg"
						>
							<SettingsIcon class="w-6 h-6 text-white" />
						</div>
						<h2 class="text-xl font-bold text-[#122555] mb-1">Mode Entraînement</h2>
						<p class="text-[#122555]/60 text-xs">Session personnalisée • Non classée</p>
					</div>

					<!-- Category Selection -->
					<div class="mb-4">
						<h3 class="text-xs font-semibold text-[#122555]/60 mb-3 uppercase tracking-wider">
							Catégories
						</h3>
						<div class="grid grid-cols-2 gap-2">
							<button
								onclick={() => toggleCategory('CLR')}
								class="p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-1 {selectedCategories.includes(
									'CLR'
								)
									? 'bg-[#122555]/10 border-[#122555]/30 text-[#122555]'
									: 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#122555]/20'}"
							>
								<ClipboardListIcon class="w-5 h-5" />
								<span>CLR ({clrCount})</span>
							</button>
							<button
								onclick={() => toggleCategory('Mouvement')}
								class="p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-1 {selectedCategories.includes(
									'Mouvement'
								)
									? 'bg-[#122555]/10 border-[#122555]/30 text-[#122555]'
									: 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#122555]/20'}"
							>
								<TruckIcon class="w-5 h-5" />
								<span>Mouvement ({mouvementCount})</span>
							</button>
							<button
								onclick={() => toggleCategory('Organisationnel')}
								class="p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-1 {selectedCategories.includes(
									'Organisationnel'
								)
									? 'bg-[#122555]/10 border-[#122555]/30 text-[#122555]'
									: 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#122555]/20'}"
							>
								<BuildingIcon class="w-5 h-5" />
								<span>Organisationnel ({organisationnelCount})</span>
							</button>
							<button
								onclick={() => toggleCategory('Trésorerie')}
								class="p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-1 {selectedCategories.includes(
									'Trésorerie'
								)
									? 'bg-[#122555]/10 border-[#122555]/30 text-[#122555]'
									: 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#122555]/20'}"
							>
								<WalletIcon class="w-5 h-5" />
								<span>Trésorerie ({tresorerieCount})</span>
							</button>
						</div>
					</div>

					<!-- Presets -->
					<div class="mb-4">
						<h3 class="text-xs font-semibold text-[#122555]/60 mb-3 uppercase tracking-wider">
							Durée
						</h3>
						<div class="grid grid-cols-4 gap-2">
							{#each presets as preset}
								<button
									onclick={() => selectPreset(preset)}
									class="group p-3 rounded-xl border-2 transition-all duration-200 {questionCount ===
										preset.questions &&
									timeLimit === preset.time &&
									!showCustom
										? 'border-transparent shadow-lg bg-gradient-to-br ' +
											preset.color +
											' text-white scale-105'
										: 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'}"
								>
									<div class="text-xl mb-1">{preset.icon}</div>
									<div class="font-bold text-xs">{preset.name}</div>
									<div class="text-xs opacity-75">{preset.questions}Q</div>
								</button>
							{/each}
						</div>
					</div>

					<!-- Custom Toggle -->
					<div class="mb-4">
						<button
							onclick={() => (showCustom = !showCustom)}
							class="w-full flex items-center justify-between px-4 py-3 text-sm text-[#122555]/70 hover:text-[#122555] border border-dashed border-[#122555]/30 rounded-xl hover:border-[#122555]/50 transition-colors"
						>
							<span class="flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
									></path>
								</svg>
								Personnaliser
							</span>
							<svg
								class="w-4 h-4 transition-transform {showCustom ? 'rotate-180' : ''}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								></path>
							</svg>
						</button>

						{#if showCustom}
							<div class="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label for="questionCount" class="block text-xs font-medium text-gray-600 mb-1"
											>Questions</label
										>
										<input
											id="questionCount"
											type="number"
											bind:value={questionCount}
											min="1"
											max={totalQuestions}
											class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
										/>
									</div>
									<div>
										<label for="timeLimit" class="block text-xs font-medium text-gray-600 mb-1"
											>Minutes</label
										>
										<input
											id="timeLimit"
											type="number"
											bind:value={timeLimit}
											min="1"
											max="120"
											class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
										/>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Summary -->
					<div
						class="bg-gradient-to-r from-[#122555]/5 to-[#122555]/10 rounded-xl p-4 mb-6 border border-[#122555]/20"
					>
						<div class="flex items-center justify-center gap-4 text-sm">
							<span class="flex items-center gap-1 text-[#122555] font-medium">
								<svg
									class="w-4 h-4 text-[#122555]/60"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{questionCount} questions
							</span>
							<span class="text-[#122555]/30">•</span>
							<span class="flex items-center gap-1 text-[#122555] font-medium">
								<svg
									class="w-4 h-4 text-[#122555]/60"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{timeLimit} min
							</span>
						</div>
						{#if selectedCategories.length < 4}
							<p class="text-xs text-[#122555]/60 text-center mt-2">
								{selectedCategories.join(', ')}
							</p>
						{/if}
					</div>

					<button
						onclick={handleStart}
						class="w-full bg-[#122555] hover:bg-[#0d1a3d] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
					>
						<span class="flex items-center justify-center gap-2">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Lancer l'entraînement
						</span>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Carousel Dots -->
	<div class="flex justify-center gap-2">
		<button
			onclick={() => switchMode(0)}
			class="w-2.5 h-2.5 rounded-full transition-all duration-300 {activeMode === 0
				? 'bg-[#122555] w-6'
				: 'bg-[#122555]/30 hover:bg-[#122555]/50'}"
			aria-label="Mode Officiel"
		></button>
		<button
			onclick={() => switchMode(1)}
			class="w-2.5 h-2.5 rounded-full transition-all duration-300 {activeMode === 1
				? 'bg-[#122555] w-6'
				: 'bg-[#122555]/30 hover:bg-[#122555]/50'}"
			aria-label="Mode Entraînement"
		></button>
	</div>

	<!-- Swipe hint for mobile -->
	<p class="text-center text-xs text-[#122555]/40 md:hidden">← Glissez pour changer de mode →</p>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.5s ease-out;
	}
</style>
