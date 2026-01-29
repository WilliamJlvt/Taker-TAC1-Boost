<script lang="ts">
	import { questions } from '$lib/data/index.js';
	import type { Question, ExamMode } from '$lib/types.js';
	import { EXAM_MODES } from '$lib/types.js';
	import { signIn } from '@auth/sveltekit/client';
	import type { Session } from '@auth/core/types';

	let { startQuiz, session }: { 
		startQuiz: (questionCount: number, timeLimit: number, categories: string[], examMode?: ExamMode) => void;
		session: Session | null;
	} = $props();

	const totalQuestions = questions.length;
	const clrCount = questions.filter(q => q.category === 'CLR').length;
	const mouvementCount = questions.filter(q => q.category === 'Mouvement').length;
	const organisationnelCount = questions.filter(q => q.category === 'Organisationnel').length;
	const tresorerieCount = questions.filter(q => q.category === 'Trésorerie').length;

	let questionCount = $state(10);
	let timeLimit = $state(3); // in minutes
	
	let selectedCategories = $state<string[]>(['CLR', 'Mouvement', 'Organisationnel', 'Trésorerie']);

	const presets = [
		{ name: "Rapide", questions: 10, time: 3, icon: "⚡", color: "from-yellow-400 to-orange-500" },
		{ name: "Moyen", questions: 25, time: 10, icon: "🎯", color: "from-blue-400 to-blue-600" },
		{ name: "Long", questions: 50, time: 25, icon: "💪", color: "from-green-400 to-green-600" },
		{ name: "Complet", questions: 100, time: 60, icon: "🏆", color: "from-purple-400 to-purple-600" }
	];

	let showCustom = $state(false);
	let showEntrainement = $state(false);

	function selectPreset(preset: typeof presets[0]) {
		questionCount = preset.questions;
		timeLimit = preset.time;
		showCustom = false;
	}

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			if (selectedCategories.length > 1) { // Prevent deselecting all
				selectedCategories = selectedCategories.filter(c => c !== category);
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
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Official Exam Modes -->
	<div class="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
		<div class="text-center mb-6">
			<h2 class="text-2xl font-bold text-gray-800 mb-2">🏆 Modes Officiels</h2>
			<p class="text-gray-600 text-sm">Ces modes sont enregistrés dans le classement</p>
		</div>
		
		{#if !session}
			<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center gap-3">
				<svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
				</svg>
				<span class="text-amber-800 text-sm">Connectez-vous pour accéder aux modes officiels et au classement</span>
			</div>
		{/if}

		<div class="grid md:grid-cols-2 gap-4">
			<!-- TAC1 Organisationnelle -->
			<button
				onclick={() => startOfficialMode('organisationnelle')}
				class="group relative p-6 pt-8 rounded-xl border-2 transition-all duration-200 text-left
					{session 
						? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 hover:border-indigo-400 hover:shadow-lg' 
						: 'border-gray-200 bg-gray-50 opacity-75 cursor-pointer'}"
			>
				<div class="absolute top-2 right-2">
					{#if session}
						<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">⭐ Classement</span>
					{:else}
						<span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">🔒 Connexion</span>
					{/if}
				</div>
				<div class="flex items-center gap-3 mb-3">
					<div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl {!session ? 'opacity-50' : ''}">
						🏢
					</div>
					<div>
						<h3 class="font-bold {session ? 'text-gray-800' : 'text-gray-500'}">TAC1 Organisationnelle</h3>
						<p class="text-xs {session ? 'text-indigo-600' : 'text-gray-400'} font-medium">
							{session ? 'Examen officiel' : 'Connexion requise'}
						</p>
					</div>
				</div>
				<p class="text-sm text-gray-600 mb-3">{EXAM_MODES.organisationnelle.description}</p>
				<div class="flex items-center gap-4 text-xs text-gray-500">
					<span class="bg-white px-2 py-1 rounded-full">{EXAM_MODES.organisationnelle.questionCount} questions</span>
					<span class="bg-white px-2 py-1 rounded-full">{EXAM_MODES.organisationnelle.timeLimit} min</span>
				</div>
			</button>

			<!-- TAC1 Trésorerie -->
			<button
				onclick={() => startOfficialMode('tresorerie')}
				class="group relative p-6 pt-8 rounded-xl border-2 transition-all duration-200 text-left
					{session 
						? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-400 hover:shadow-lg' 
						: 'border-gray-200 bg-gray-50 opacity-75 cursor-pointer'}"
			>
				<div class="absolute top-2 right-2">
					{#if session}
						<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">⭐ Classement</span>
					{:else}
						<span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">🔒 Connexion</span>
					{/if}
				</div>
				<div class="flex items-center gap-3 mb-3">
					<div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl {!session ? 'opacity-50' : ''}">
						💰
					</div>
					<div>
						<h3 class="font-bold {session ? 'text-gray-800' : 'text-gray-500'}">TAC1 Trésorerie</h3>
						<p class="text-xs {session ? 'text-emerald-600' : 'text-gray-400'} font-medium">
							{session ? 'Examen officiel' : 'Connexion requise'}
						</p>
					</div>
				</div>
				<p class="text-sm text-gray-600 mb-3">{EXAM_MODES.tresorerie.description}</p>
				<div class="flex items-center gap-4 text-xs text-gray-500">
					<span class="bg-white px-2 py-1 rounded-full">{EXAM_MODES.tresorerie.questionCount} questions</span>
					<span class="bg-white px-2 py-1 rounded-full">{EXAM_MODES.tresorerie.timeLimit} min</span>
				</div>
			</button>
		</div>
		
		<!-- Link to Scoreboard -->
		<div class="text-center mt-6">
			<a 
				href="/scoreboard" 
				class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
			>
				Voir le classement
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</a>
		</div>
	</div>

	<!-- Training Mode Toggle -->
	<div class="text-center">
		<button
			onclick={() => showEntrainement = !showEntrainement}
			class="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm transition-all"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
			</svg>
			Mode Entraînement (non classé)
			<svg class="w-4 h-4 transition-transform {showEntrainement ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</button>
	</div>

	<!-- Training Mode Panel -->
	{#if showEntrainement}
	<div class="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
		<div class="mb-6 text-center">
			<h2 class="text-xl font-bold text-gray-800 mb-2">Mode Entraînement</h2>
			<p class="text-gray-500 text-sm">Personnalisez votre session • Non enregistré au classement</p>
		</div>

		<!-- Category Selection -->
		<div class="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
			<h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Catégories</h3>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
				<button 
					onclick={() => toggleCategory('CLR')}
					class="p-2 rounded-lg border transition-all duration-200 text-sm font-medium {selectedCategories.includes('CLR') ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200'}"
				>
					CLR ({clrCount})
				</button>
				<button 
					onclick={() => toggleCategory('Mouvement')}
					class="p-2 rounded-lg border transition-all duration-200 text-sm font-medium {selectedCategories.includes('Mouvement') ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-200 text-gray-500 hover:border-green-200'}"
				>
					Mouvement ({mouvementCount})
				</button>
				<button 
					onclick={() => toggleCategory('Organisationnel')}
					class="p-2 rounded-lg border transition-all duration-200 text-sm font-medium {selectedCategories.includes('Organisationnel') ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-200'}"
				>
					Organisationnel ({organisationnelCount})
				</button>
				<button 
					onclick={() => toggleCategory('Trésorerie')}
					class="p-2 rounded-lg border transition-all duration-200 text-sm font-medium {selectedCategories.includes('Trésorerie') ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-gray-200 text-gray-500 hover:border-amber-200'}"
				>
					Trésorerie ({tresorerieCount})
				</button>
			</div>
		</div>

		<!-- Mode Selection -->
		<div class="mb-8">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
				{#each presets as preset}
					<button
						onclick={() => selectPreset(preset)}
						class="group relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 {
							questionCount === preset.questions && timeLimit === preset.time && !showCustom
								? 'border-white shadow-xl bg-gradient-to-br ' + preset.color + ' text-white'
								: 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
						}"
					>
						<div class="text-2xl mb-2">{preset.icon}</div>
						<div class="font-bold text-sm mb-1">{preset.name}</div>
						<div class="text-xs opacity-75">{preset.questions}Q • {preset.time}min</div>
					</button>
				{/each}
			</div>

			<!-- Custom Toggle -->
			<div class="text-center">
				<button
					onclick={() => showCustom = !showCustom}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
					</svg>
					Mode personnalisé
					<svg class="w-4 h-4 transition-transform {showCustom ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</button>
			</div>

			<!-- Custom Settings (Collapsed) -->
			{#if showCustom}
				<div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="questionCount" class="block text-sm font-medium text-gray-700 mb-1">Questions</label>
							<input
								id="questionCount"
								type="number"
								bind:value={questionCount}
								min="1"
								max={totalQuestions}
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label for="timeLimit" class="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
							<input
								id="timeLimit"
								type="number"
								bind:value={timeLimit}
								min="1"
								max="120"
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
			<div class="flex items-center justify-center mb-2">
				<svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd"></path>
				</svg>
				<span class="text-yellow-800 font-semibold">{questionCount} questions - {timeLimit} minute{timeLimit > 1 ? 's' : ''}</span>
			</div>
			<p class="text-yellow-700 text-sm">Les questions et réponses seront mélangées aléatoirement</p>
			{#if selectedCategories.length < 4}
				<p class="text-yellow-600 text-xs mt-1">Catégories : {selectedCategories.join(', ')}</p>
			{/if}
		</div>

		<button 
			onclick={handleStart}
			class="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
		>
			Lancer l'entraînement
		</button>
	</div>
	{/if}
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