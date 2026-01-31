<script lang="ts">
	import { onMount } from 'svelte';
	import { quizResult, currentExamMode } from '$lib/stores.js';
	import { formatTime } from '$lib/quiz.js';
	import type { QuizResult, QuizAnswer, ExamMode } from '$lib/types.js';
	import type { Session } from '@auth/core/types';

	let { resetQuiz, session }: { resetQuiz: () => void; session: Session | null } = $props();

	let result = $state<QuizResult | null>(null);
	let examMode = $state<ExamMode>('custom');
	let showAnimation = $state(false);
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');

	$effect(() => {
		result = $quizResult;
	});

	$effect(() => {
		examMode = $currentExamMode;
	});

	onMount(() => {
		setTimeout(() => {
			showAnimation = true;
		}, 100);

		// Auto-save score if authenticated and official mode
		saveScoreIfEligible();
	});

	async function saveScoreIfEligible() {
		const r = $quizResult;
		const mode = $currentExamMode;

		if (!session?.user || !r || mode === 'custom') return;

		saveStatus = 'saving';

		try {
			const response = await fetch('/api/scores', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					examMode: mode,
					score: r.score,
					totalQuestions: r.totalQuestions,
					correctAnswers: r.answers.filter((a) => a.isCorrect).length,
					timeSpent: r.timeSpent,
					categoryScores: r.categoryScores,
					questionResults: r.answers.map((a) => ({
						questionId: a.questionId,
						isCorrect: a.isCorrect
					}))
				})
			});

			if (response.ok) {
				saveStatus = 'saved';
			} else {
				saveStatus = 'error';
			}
		} catch {
			saveStatus = 'error';
		}
	}

	const scoreColor = $derived(
		result
			? result.score >= 80
				? 'text-green-600'
				: result.score >= 60
					? 'text-yellow-600'
					: 'text-red-600'
			: ''
	);
	const scoreBg = $derived(
		result
			? result.score >= 80
				? 'from-green-50 to-green-100'
				: result.score >= 60
					? 'from-yellow-50 to-yellow-100'
					: 'from-red-50 to-red-100'
			: ''
	);
	const scoreBorder = $derived(
		result
			? result.score >= 80
				? 'border-green-200'
				: result.score >= 60
					? 'border-yellow-200'
					: 'border-red-200'
			: ''
	);

	function shareResults() {
		const r = result;
		if (!r) return;
		const shareText = `J'ai obtenu ${r.score}% au test TAC1 Boost ! 🎯\n${r.score >= 80 ? 'Excellent !' : r.score >= 60 ? 'Bien joué !' : 'Il faut réviser encore !'}`;

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
		const r = result;
		if (!r) return;

		const pdf = `
RÉSULTATS TAC1 BOOST
==================

Score: ${r.score}%
Questions: ${r.answers.filter((a: QuizAnswer) => a.isCorrect).length}/${r.totalQuestions} correctes
Temps total: ${formatTime(r.timeSpent)}

DÉTAIL PAR CATÉGORIE:
${Object.entries(r.categoryScores)
	.map(
		([category, scores]: [string, any]) =>
			`${category}: ${scores.correct}/${scores.total} (${Math.round((scores.correct / scores.total) * 100)}%)`
	)
	.join('\n')}

ERREURS:
${r.answers
	.map((answer: any, index: number) => ({ answer, index }))
	.filter(({ answer }: any) => !answer.isCorrect)
	.map(({ index }: any) => `Q${index + 1}: ${r.answers[index].selectedAnswer}`)
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
		<div
			class="bg-white rounded-2xl shadow-xl overflow-hidden {showAnimation
				? 'animate-slide-up'
				: 'opacity-0'}"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r {scoreBg} border-b {scoreBorder} p-8 text-center">
				<div class="mb-4">
					{#if result.score >= 80}
						<div
							class="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4"
						>
							<svg
								class="w-10 h-10 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<h2 class="text-3xl font-bold text-green-800 mb-2">Excellent !</h2>
					{:else if result.score >= 60}
						<div
							class="w-20 h-20 bg-yellow-500 rounded-full mx-auto flex items-center justify-center mb-4"
						>
							<svg
								class="w-10 h-10 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<h2 class="text-3xl font-bold text-yellow-800 mb-2">Bien joué !</h2>
					{:else}
						<div
							class="w-20 h-20 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4"
						>
							<svg
								class="w-10 h-10 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<h2 class="text-3xl font-bold text-red-800 mb-2">Il faut réviser !</h2>
					{/if}
					<p class="text-[#122555]/60">Test TAC1 terminé</p>
				</div>

				<div class="text-6xl font-bold {scoreColor} mb-2 {showAnimation ? 'animate-bounce' : ''}">
					{result.score}%
				</div>
				<p class="text-lg text-[#122555]/80">
					{result.answers.filter((a) => a.isCorrect).length} / {result.totalQuestions} questions correctes
				</p>

				<!-- Score Save Status -->
				{#if examMode !== 'custom'}
					<div class="mt-4">
						{#if saveStatus === 'saving'}
							<span
								class="inline-flex items-center gap-2 px-3 py-1 bg-[#122555]/10 text-[#122555] rounded-full text-sm"
							>
								<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									></path>
								</svg>
								Enregistrement...
							</span>
						{:else if saveStatus === 'saved'}
							<span
								class="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
							>
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									></path>
								</svg>
								Score enregistré au classement !
							</span>
						{:else if saveStatus === 'error'}
							<span
								class="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
							>
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									></path>
								</svg>
								Erreur lors de l'enregistrement
							</span>
						{:else if !session}
							<span
								class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
									></path>
								</svg>
								Connectez-vous pour enregistrer votre score
							</span>
						{/if}
					</div>
				{:else}
					<div class="mt-4">
						<span
							class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm"
						>
							Mode entraînement • Non classé
						</span>
					</div>
				{/if}
			</div>

			<!-- Stats -->
			<div class="p-8">
				<div class="grid md:grid-cols-2 gap-6 mb-8">
					<div class="bg-[#122555]/5 rounded-lg p-6">
						<h3 class="text-lg font-semibold text-[#122555] mb-4">Statistiques globales</h3>
						<div class="space-y-3">
							<div class="flex justify-between">
								<span class="text-[#122555]/70">Temps total</span>
								<span class="font-medium">{formatTime(result.timeSpent)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Temps moyen par question</span>
								<span class="font-medium"
									>{formatTime(Math.round(result.timeSpent / result.totalQuestions))}</span
								>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Réponses correctes</span>
								<span class="font-medium text-green-600"
									>{result.answers.filter((a) => a.isCorrect).length}</span
								>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Réponses incorrectes</span>
								<span class="font-medium text-red-600"
									>{result.answers.filter((a) => !a.isCorrect).length}</span
								>
							</div>
						</div>
					</div>

					<div class="bg-[#122555]/5 rounded-lg p-6">
						<h3 class="text-lg font-semibold text-[#122555] mb-4">Résultats par catégorie</h3>
						<div class="space-y-4">
							{#each Object.entries(result.categoryScores) as [category, scores] (category)}
								{@const percentage = Math.round((scores.correct / scores.total) * 100)}
								<div>
									<div class="flex justify-between mb-1">
										<span class="text-sm font-medium text-[#122555]">
											{category}
										</span>
										<span class="text-sm text-[#122555]/60">{scores.correct}/{scores.total}</span>
									</div>
									<div class="w-full bg-[#122555]/10 rounded-full h-2">
										<div
											class="h-2 rounded-full transition-all duration-1000 bg-[#122555]"
											style="width: {percentage}%"
										></div>
									</div>
									<div class="text-xs text-[#122555]/60 mt-1">{percentage}%</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Errors Summary -->
				{#if result.answers.filter((a) => !a.isCorrect).length > 0}
					<div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
						<h3 class="text-lg font-semibold text-red-800 mb-4">
							Erreurs à réviser ({result.answers.filter((a) => !a.isCorrect).length})
						</h3>
						<div class="max-h-60 overflow-y-auto space-y-2">
							{#each result.answers.filter((a) => !a.isCorrect) as errorAnswer (errorAnswer.questionId)}
								<div class="text-sm">
									<span class="font-medium text-red-700"
										>Q{result.answers.indexOf(errorAnswer) + 1}:</span
									>
									<span class="text-red-600">Votre réponse - {errorAnswer.selectedAnswer}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex flex-col sm:flex-row gap-4">
					{#if saveStatus === 'saved' || examMode !== 'custom'}
						<a
							href="/scoreboard"
							class="flex-1 bg-[#122555] hover:bg-[#0d1a3d] text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200 text-center"
						>
							Voir le classement
						</a>
					{/if}
					<button
						onclick={shareResults}
						class="flex-1 bg-[#122555] hover:bg-[#0d1a3d] text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200"
					>
						Partager
					</button>
					<button
						onclick={downloadPDF}
						class="flex-1 bg-[#122555] hover:bg-[#0d1a3d] text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200"
					>
						Télécharger
					</button>
				</div>

				<!-- Back to Home -->
				<div class="mt-6 text-center">
					<a
						onclick={resetQuiz}
						href="/"
						class="inline-flex items-center gap-2 text-[#122555] hover:text-[#122555]/70 font-medium transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Retour à l'accueil
					</a>
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
