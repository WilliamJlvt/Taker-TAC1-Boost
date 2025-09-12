<script lang="ts">
	import { onMount } from 'svelte';
	import { quizResult } from '$lib/stores.js';
	import { formatTime } from '$lib/quiz.js';

	let { resetQuiz } = $props<{ resetQuiz: () => void }>();

	let result = $state<any>(null);
	let showAnimation = $state(false);

	$effect(() => {
		result = $quizResult;
	});

	onMount(() => {
		setTimeout(() => {
			showAnimation = true;
		}, 100);
	});

	const scoreColor = $derived(result ? (result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600') : '');
	const scoreBg = $derived(result ? (result.score >= 80 ? 'from-green-50 to-green-100' : result.score >= 60 ? 'from-yellow-50 to-yellow-100' : 'from-red-50 to-red-100') : '');
	const scoreBorder = $derived(result ? (result.score >= 80 ? 'border-green-200' : result.score >= 60 ? 'border-yellow-200' : 'border-red-200') : '');

	function shareResults() {
		const shareText = `J'ai obtenu ${result.score}% au test TAC1 Boost ! 🎯\n${result.score >= 80 ? 'Excellent !' : result.score >= 60 ? 'Bien joué !' : 'Il faut réviser encore !'}`;
		
		if (navigator.share) {
			navigator.share({
				title: 'Mes résultats TAC1 Boost',
				text: shareText,
				url: window.location.href
			});
		} else {
			navigator.clipboard.writeText(shareText);
			alert('Résultats copiés dans le presse-papier !');
		}
	}

	function downloadPDF() {
		if (!result) return;
		
		const pdf = `
RÉSULTATS TAC1 BOOST
==================

Score: ${result.score}%
Questions: ${result.answers.filter(a => a.isCorrect).length}/${result.totalQuestions} correctes
Temps total: ${formatTime(result.timeSpent)}

DÉTAIL PAR CATÉGORIE:
${Object.entries(result.categoryScores).map(([category, scores]: [string, any]) => 
	`${category}: ${scores.correct}/${scores.total} (${Math.round(scores.correct / scores.total * 100)}%)`
).join('\n')}

ERREURS:
${result.answers
	.map((answer: any, index: number) => ({ answer, index }))
	.filter(({ answer }: any) => !answer.isCorrect)
	.map(({ index }: any) => `Q${index + 1}: ${result.answers[index].selectedAnswer}`)
	.join('\n')}
		`.trim();

		const blob = new Blob([pdf], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `TAC1_Boost_Resultats_${new Date().toISOString().split('T')[0]}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

{#if result}
	<div class="max-w-4xl mx-auto">
		<div class="bg-white rounded-2xl shadow-xl overflow-hidden {showAnimation ? 'animate-slide-up' : 'opacity-0'}">
			<!-- Header -->
			<div class="bg-gradient-to-r {scoreBg} border-b {scoreBorder} p-8 text-center">
				<div class="mb-4">
					{#if result.score >= 80}
						<div class="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
							<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<h2 class="text-3xl font-bold text-green-800 mb-2">Excellent !</h2>
					{:else if result.score >= 60}
						<div class="w-20 h-20 bg-yellow-500 rounded-full mx-auto flex items-center justify-center mb-4">
							<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<h2 class="text-3xl font-bold text-yellow-800 mb-2">Bien joué !</h2>
					{:else}
						<div class="w-20 h-20 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
							<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<h2 class="text-3xl font-bold text-red-800 mb-2">Il faut réviser !</h2>
					{/if}
					<p class="text-gray-600">Test TAC1 terminé</p>
				</div>
				
				<div class="text-6xl font-bold {scoreColor} mb-2 {showAnimation ? 'animate-bounce' : ''}">
					{result.score}%
				</div>
				<p class="text-lg text-gray-700">
					{result.answers.filter(a => a.isCorrect).length} / {result.totalQuestions} questions correctes
				</p>
			</div>

			<!-- Stats -->
			<div class="p-8">
				<div class="grid md:grid-cols-2 gap-6 mb-8">
					<div class="bg-gray-50 rounded-lg p-6">
						<h3 class="text-lg font-semibold text-gray-800 mb-4">Statistiques globales</h3>
						<div class="space-y-3">
							<div class="flex justify-between">
								<span class="text-gray-600">Temps total</span>
								<span class="font-medium">{formatTime(result.timeSpent)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Temps moyen par question</span>
								<span class="font-medium">{formatTime(Math.round(result.timeSpent / result.totalQuestions))}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Réponses correctes</span>
								<span class="font-medium text-green-600">{result.answers.filter(a => a.isCorrect).length}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Réponses incorrectes</span>
								<span class="font-medium text-red-600">{result.answers.filter(a => !a.isCorrect).length}</span>
							</div>
						</div>
					</div>

					<div class="bg-gray-50 rounded-lg p-6">
						<h3 class="text-lg font-semibold text-gray-800 mb-4">Résultats par catégorie</h3>
						<div class="space-y-4">
							{#each Object.entries(result.categoryScores) as [category, scores]}
								{@const percentage = Math.round((scores.correct / scores.total) * 100)}
								<div>
									<div class="flex justify-between mb-1">
										<span class="text-sm font-medium {category === 'CLR' ? 'text-blue-700' : category === 'Mouvement' ? 'text-green-700' : 'text-purple-700'}">
											{category}
										</span>
										<span class="text-sm text-gray-600">{scores.correct}/{scores.total}</span>
									</div>
									<div class="w-full bg-gray-200 rounded-full h-2">
										<div 
											class="h-2 rounded-full transition-all duration-1000 {category === 'CLR' ? 'bg-blue-500' : category === 'Mouvement' ? 'bg-green-500' : 'bg-purple-500'}"
											style="width: {percentage}%"
										></div>
									</div>
									<div class="text-xs text-gray-500 mt-1">{percentage}%</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Errors Summary -->
				{#if result.answers.filter(a => !a.isCorrect).length > 0}
					<div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
						<h3 class="text-lg font-semibold text-red-800 mb-4">
							Erreurs à réviser ({result.answers.filter(a => !a.isCorrect).length})
						</h3>
						<div class="max-h-60 overflow-y-auto space-y-2">
							{#each result.answers.filter(a => !a.isCorrect) as errorAnswer, index}
								<div class="text-sm">
									<span class="font-medium text-red-700">Q{result.answers.indexOf(errorAnswer) + 1}:</span>
									<span class="text-red-600">Votre réponse - {errorAnswer.selectedAnswer}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex flex-col sm:flex-row gap-4">
					<button 
						onclick={resetQuiz}
						class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200"
					>
						Refaire un test
					</button>
					<button 
						onclick={shareResults}
						class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200"
					>
						Partager
					</button>
					<button 
						onclick={downloadPDF}
						class="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200"
					>
						Télécharger
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-slide-up {
		animation: slide-up 0.6s ease-out;
	}
</style>