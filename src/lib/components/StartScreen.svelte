<script lang="ts">
	import { questions } from '$lib/data/index.js';
	import type { Question, ExamMode } from '$lib/types.js';
	import { EXAM_MODES } from '$lib/types.js';
	import { signIn } from '@auth/sveltekit/client';
	import type { Session } from '@auth/core/types';

	let {
		startQuiz,
		session
	}: {
		startQuiz: (
			questionCount: number,
			timeLimit: number,
			categories: string[],
			examMode?: ExamMode
		) => void;
		session: Session | null;
	} = $props();

	const totalQuestions = questions.length;
	const clrCount = questions.filter((q) => q.category === 'CLR').length;
	const mouvementCount = questions.filter((q) => q.category === 'Mouvement').length;
	const organisationnelCount = questions.filter((q) => q.category === 'Organisationnel').length;
	const tresorerieCount = questions.filter((q) => q.category === 'Trésorerie').length;

	let questionCount = $state(10);
	let timeLimit = $state(3);

	let selectedCategories = $state<string[]>(['CLR', 'Mouvement', 'Organisationnel', 'Trésorerie']);

	// Carousel state: 0 = official, 1 = training
	let activeMode = $state(0);
	let isDragging = $state(false);
	let startX = $state(0);
	let currentTranslate = $state(0);

	const presets = [
		{ name: 'Rapide', questions: 10, time: 3, icon: '⚡', color: 'from-yellow-400 to-orange-500' },
		{ name: 'Moyen', questions: 25, time: 10, icon: '🎯', color: 'from-blue-400 to-blue-600' },
		{ name: 'Long', questions: 50, time: 25, icon: '💪', color: 'from-green-400 to-green-600' },
		{
			name: 'Complet',
			questions: 100,
			time: 60,
			icon: '🏆',
			color: 'from-purple-400 to-purple-600'
		}
	];

	let showCustom = $state(false);

	function selectPreset(preset: (typeof presets)[0]) {
		questionCount = preset.questions;
		timeLimit = preset.time;
		showCustom = false;
	}

	function toggleCategory(category: string) {
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

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Mode Selector Tabs -->
	<div class="flex justify-center">
		<div class="inline-flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
			<button
				onclick={() => switchMode(0)}
				class="relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 {activeMode ===
				0
					? 'bg-white text-gray-800 shadow-lg'
					: 'text-gray-500 hover:text-gray-700'}"
			>
				<span class="flex items-center gap-2"> 🏆 Mode Officiel </span>
				{#if activeMode === 0}
					<div
						class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
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
				<span class="flex items-center gap-2"> ⚙️ Entraînement </span>
				{#if activeMode === 1}
					<div
						class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"
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
				<div class="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
					<div class="text-center mb-6">
						<div
							class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
						>
							<span class="text-3xl">🏆</span>
						</div>
						<h2 class="text-2xl font-bold text-gray-800 mb-2">Modes Officiels</h2>
						<p class="text-gray-500 text-sm">Scores enregistrés dans le classement</p>
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
						<!-- TAC1 Organisationnelle -->
						<button
							onclick={() => startOfficialMode('organisationnelle')}
							class="w-full group relative p-5 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden
								{session
								? 'border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1'
								: 'border-gray-200 bg-gray-50 opacity-60 cursor-pointer'}"
						>
							<div
								class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full -translate-y-1/2 translate-x-1/2"
							></div>
							<div class="relative flex items-center gap-4">
								<div
									class="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg {!session
										? 'opacity-50'
										: 'group-hover:scale-110 transition-transform'}"
								>
									🏢
								</div>
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<h3 class="font-bold text-lg {session ? 'text-gray-800' : 'text-gray-500'}">
											TAC1 Organisationnelle
										</h3>
										{#if session}
											<span
												class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium"
												>⭐ Classé</span
											>
										{/if}
									</div>
									<p class="text-sm text-gray-500 mb-2">
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
									class="w-6 h-6 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
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
								? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1'
								: 'border-gray-200 bg-gray-50 opacity-60 cursor-pointer'}"
						>
							<div
								class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-1/2 translate-x-1/2"
							></div>
							<div class="relative flex items-center gap-4">
								<div
									class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg {!session
										? 'opacity-50'
										: 'group-hover:scale-110 transition-transform'}"
								>
									💰
								</div>
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<h3 class="font-bold text-lg {session ? 'text-gray-800' : 'text-gray-500'}">
											TAC1 Trésorerie
										</h3>
										{#if session}
											<span
												class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium"
												>⭐ Classé</span
											>
										{/if}
									</div>
									<p class="text-sm text-gray-500 mb-2">{EXAM_MODES.tresorerie.description}</p>
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
									class="w-6 h-6 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
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
					<div class="text-center mt-6 pt-6 border-t border-gray-100">
						<a
							href="/scoreboard"
							class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
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

			<!-- Slide 2: Training Mode -->
			<div class="w-full flex-shrink-0 px-1">
				<div class="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
					<div class="text-center mb-6">
						<div
							class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl mb-4 shadow-lg"
						>
							<span class="text-3xl">⚙️</span>
						</div>
						<h2 class="text-2xl font-bold text-gray-800 mb-2">Mode Entraînement</h2>
						<p class="text-gray-500 text-sm">Session personnalisée • Non classée</p>
					</div>

					<!-- Category Selection -->
					<div class="mb-6">
						<h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
							Catégories
						</h3>
						<div class="grid grid-cols-2 gap-2">
							<button
								onclick={() => toggleCategory('CLR')}
								class="p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium {selectedCategories.includes(
									'CLR'
								)
									? 'bg-blue-50 border-blue-300 text-blue-700'
									: 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-200'}"
							>
								<span class="block text-lg mb-1">📋</span>
								CLR ({clrCount})
							</button>
							<button
								onclick={() => toggleCategory('Mouvement')}
								class="p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium {selectedCategories.includes(
									'Mouvement'
								)
									? 'bg-green-50 border-green-300 text-green-700'
									: 'bg-gray-50 border-gray-200 text-gray-500 hover:border-green-200'}"
							>
								<span class="block text-lg mb-1">🚚</span>
								Mouvement ({mouvementCount})
							</button>
							<button
								onclick={() => toggleCategory('Organisationnel')}
								class="p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium {selectedCategories.includes(
									'Organisationnel'
								)
									? 'bg-purple-50 border-purple-300 text-purple-700'
									: 'bg-gray-50 border-gray-200 text-gray-500 hover:border-purple-200'}"
							>
								<span class="block text-lg mb-1">🏢</span>
								Organisationnel ({organisationnelCount})
							</button>
							<button
								onclick={() => toggleCategory('Trésorerie')}
								class="p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium {selectedCategories.includes(
									'Trésorerie'
								)
									? 'bg-amber-50 border-amber-300 text-amber-700'
									: 'bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-200'}"
							>
								<span class="block text-lg mb-1">💰</span>
								Trésorerie ({tresorerieCount})
							</button>
						</div>
					</div>

					<!-- Presets -->
					<div class="mb-6">
						<h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Durée</h3>
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
					<div class="mb-6">
						<button
							onclick={() => (showCustom = !showCustom)}
							class="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:text-gray-800 border border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
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
						class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200"
					>
						<div class="flex items-center justify-center gap-4 text-sm">
							<span class="flex items-center gap-1 text-gray-700 font-medium">
								<svg
									class="w-4 h-4 text-gray-500"
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
							<span class="text-gray-300">•</span>
							<span class="flex items-center gap-1 text-gray-700 font-medium">
								<svg
									class="w-4 h-4 text-gray-500"
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
							<p class="text-xs text-gray-500 text-center mt-2">{selectedCategories.join(', ')}</p>
						{/if}
					</div>

					<button
						onclick={handleStart}
						class="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
				? 'bg-indigo-500 w-6'
				: 'bg-gray-300 hover:bg-gray-400'}"
			aria-label="Mode Officiel"
		></button>
		<button
			onclick={() => switchMode(1)}
			class="w-2.5 h-2.5 rounded-full transition-all duration-300 {activeMode === 1
				? 'bg-gray-600 w-6'
				: 'bg-gray-300 hover:bg-gray-400'}"
			aria-label="Mode Entraînement"
		></button>
	</div>

	<!-- Swipe hint for mobile -->
	<p class="text-center text-xs text-gray-400 md:hidden">← Glissez pour changer de mode →</p>
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
