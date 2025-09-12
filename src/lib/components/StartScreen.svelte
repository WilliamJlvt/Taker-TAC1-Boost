<script lang="ts">
	import { questions } from '$lib/data/index.js';

	let { startQuiz } = $props<{ startQuiz: (questionCount: number, timeLimit: number) => void }>();

	const totalQuestions = questions.length;
	const clrCount = questions.filter(q => q.category === 'CLR').length;
	const mouvementCount = questions.filter(q => q.category === 'Mouvement').length;
	const organisationnelCount = questions.filter(q => q.category === 'Organisationnel').length;

	let questionCount = $state(10);
	let timeLimit = $state(3); // in minutes

	const presets = [
		{ name: "Rapide", questions: 10, time: 3, icon: "⚡", color: "from-yellow-400 to-orange-500" },
		{ name: "Moyen", questions: 25, time: 10, icon: "🎯", color: "from-blue-400 to-blue-600" },
		{ name: "Long", questions: 50, time: 25, icon: "💪", color: "from-green-400 to-green-600" },
		{ name: "Complet", questions: 100, time: 60, icon: "🏆", color: "from-purple-400 to-purple-600" }
	];

	let showCustom = $state(false);

	function selectPreset(preset: typeof presets[0]) {
		questionCount = preset.questions;
		timeLimit = preset.time;
		showCustom = false;
	}

	function handleStart() {
		startQuiz(questionCount, timeLimit);
	}
</script>

<div class="max-w-2xl mx-auto">
	<div class="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
		<div class="mb-8">
			<div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
				<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
				</svg>
			</div>
			<h2 class="text-2xl font-bold text-gray-800 mb-2">Prêt pour votre test TAC1 ?</h2>
			<p class="text-gray-600">Choisissez votre mode de révision</p>
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

		<div class="grid md:grid-cols-3 gap-4 mb-8">
			<div class="bg-blue-50 rounded-lg p-4">
				<h3 class="font-semibold text-blue-700 mb-1">CLR</h3>
				<p class="text-blue-600 text-sm">{clrCount} questions</p>
			</div>
			<div class="bg-green-50 rounded-lg p-4">
				<h3 class="font-semibold text-green-700 mb-1">Mouvement</h3>
				<p class="text-green-600 text-sm">{mouvementCount} questions</p>
			</div>
			<div class="bg-purple-50 rounded-lg p-4">
				<h3 class="font-semibold text-purple-700 mb-1">Organisationnel</h3>
				<p class="text-purple-600 text-sm">{organisationnelCount} questions</p>
			</div>
		</div>

		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
			<div class="flex items-center justify-center mb-2">
				<svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd"></path>
				</svg>
				<span class="text-yellow-800 font-semibold">{questionCount} questions - {timeLimit} minute{timeLimit > 1 ? 's' : ''}</span>
			</div>
			<p class="text-yellow-700 text-sm">Les questions et réponses seront mélangées aléatoirement</p>
		</div>

		<button 
			onclick={handleStart}
			class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
		>
			Commencer le test
		</button>
	</div>
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