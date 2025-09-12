<script lang="ts">
	import { onMount } from 'svelte';
	import { currentQuiz, currentQuestionIndex, quizAnswers, quizStartTime, quizResult } from '$lib/stores.js';
	import { calculateResult } from '$lib/quiz.js';
	import type { QuizAnswer } from '$lib/types.js';

	let { onComplete } = $props<{ onComplete: () => void }>();

	let quiz = $state<any[]>([]);
	let questionIndex = $state(0);
	let answers = $state<QuizAnswer[]>([]);
	let selectedChoice = $state<string | null>(null);
	let isAnswered = $state(false);
	let questionStartTime = $state(Date.now());
	let showFeedback = $state(false);
	let canSkip = $state(false);
	let autoSkipTimer: number | null = $state(null);

	$effect(() => {
		quiz = $currentQuiz;
		const newQuestionIndex = $currentQuestionIndex;
		answers = $quizAnswers;
		
		// Reset question state when index changes
		if (newQuestionIndex !== questionIndex) {
			questionIndex = newQuestionIndex;
			selectedChoice = null;
			isAnswered = false;
			showFeedback = false;
			canSkip = false;
			questionStartTime = Date.now();
			
			// Clear any existing timer
			if (autoSkipTimer) {
				clearTimeout(autoSkipTimer);
				autoSkipTimer = null;
			}
		}
	});

	const currentQuestion = $derived(quiz[questionIndex]);
	const progressPercent = $derived(quiz.length > 0 ? ((questionIndex + 1) / quiz.length) * 100 : 0);

	function selectChoice(choice: string) {
		if (isAnswered) return;
		
		selectedChoice = choice;
		isAnswered = true;
		showFeedback = true;
		
		const timeSpent = (Date.now() - questionStartTime) / 1000;
		const isCorrect = choice === currentQuestion.correctAnswer;
		
		const answer: QuizAnswer = {
			questionId: currentQuestion.id,
			selectedAnswer: choice,
			isCorrect,
			timeSpent
		};
		
		const newAnswers = [...answers, answer];
		answers = newAnswers;
		quizAnswers.set(newAnswers);
		
		canSkip = true;
	}

	function nextQuestion() {
		// Clear the auto skip timer if it exists
		if (autoSkipTimer) {
			clearTimeout(autoSkipTimer);
			autoSkipTimer = null;
		}
		
		if (questionIndex + 1 >= quiz.length) {
			const totalTime = ($quizStartTime ? Date.now() - $quizStartTime : 0) / 1000;
			const result = calculateResult(quiz, answers, totalTime);
			quizResult.set(result);
			onComplete();
			return;
		}

		// Update the store - the effect will handle the reset
		currentQuestionIndex.set(questionIndex + 1);
	}

	onMount(() => {
		questionStartTime = Date.now();
		
		// Keyboard shortcuts
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Enter' && canSkip) {
				nextQuestion();
			} else if (event.key === ' ' && canSkip) {
				event.preventDefault();
				nextQuestion();
			}
		}
		
		document.addEventListener('keydown', handleKeydown);
		
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if currentQuestion}
	<div>
		<div class="bg-white rounded-2xl shadow-xl overflow-hidden">
			<!-- Progress Bar -->
			<div class="bg-gray-100 h-2">
				<div 
					class="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300 ease-out"
					style="width: {progressPercent}%"
				></div>
			</div>
			
			<!-- Question Header -->
			<div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
				<div class="flex justify-between items-center">
					<span class="text-sm font-medium text-gray-600">
						Question {questionIndex + 1} sur {quiz.length}
					</span>
					<span class="px-3 py-1 rounded-full text-xs font-medium {currentQuestion.category === 'CLR' ? 'bg-blue-100 text-blue-700' : currentQuestion.category === 'Mouvement' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}">
						{currentQuestion.category}
					</span>
				</div>
			</div>

			<!-- Question Content -->
			<div class="p-8">
				<h2 class="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
					{currentQuestion.question}
				</h2>

				<!-- Choices -->
				<div class="space-y-3">
					{#each currentQuestion.choices as choice, index}
						<button
							onclick={() => selectChoice(choice)}
							disabled={isAnswered}
							class="w-full p-4 text-left rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.02] {
								isAnswered 
									? choice === currentQuestion.correctAnswer
										? 'border-green-500 bg-green-50 text-green-800'
										: choice === selectedChoice
											? 'border-red-500 bg-red-50 text-red-800'
											: 'border-gray-200 bg-gray-50 text-gray-500'
									: 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
							} {isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}"
						>
							<div class="flex items-center">
								<span class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold mr-4 {
									isAnswered
										? choice === currentQuestion.correctAnswer
											? 'border-green-500 bg-green-500 text-white'
											: choice === selectedChoice
												? 'border-red-500 bg-red-500 text-white'
												: 'border-gray-300 bg-gray-100'
										: 'border-gray-300'
								}">
									{String.fromCharCode(65 + index)}
								</span>
								<span class="flex-1">{choice}</span>
								{#if isAnswered && choice === currentQuestion.correctAnswer}
									<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
								{:else if isAnswered && choice === selectedChoice && choice !== currentQuestion.correctAnswer}
									<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
									</svg>
								{/if}
							</div>
						</button>
					{/each}
				</div>

				{#if showFeedback}
					<div class="mt-6 p-4 rounded-lg {selectedChoice === currentQuestion.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center">
								{#if selectedChoice === currentQuestion.correctAnswer}
									<svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									<span class="font-semibold text-green-800">Correct !</span>
								{:else}
									<svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
									</svg>
									<span class="font-semibold text-red-800">Incorrect</span>
								{/if}
							</div>
							{#if canSkip}
								<button
									onclick={nextQuestion}
									class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
								>
									Suivant
									<div class="flex items-center gap-1">
										<span class="text-xs bg-blue-400 px-1.5 py-0.5 rounded border border-blue-300">
											<svg class="w-3 h-3 inline fill-current" viewBox="0 0 350.439 350.439">
												<path d="M312.856,36.464H202.507c-4.87,0-8.83,3.961-8.83,8.832v138.422H52.371c-4.87,0-8.832,3.973-8.832,8.843v108.023
													c0,4.87,3.961,8.831,8.832,8.831l260.474-0.071c4.873,0,8.838-3.962,8.838-8.843l0.011-255.211
													C321.701,40.425,317.737,36.464,312.856,36.464z M175.216,253.617c0,5.724-4.635,10.353-10.356,10.353h-57.814
													c-0.392,0-0.775-0.022-1.155-0.065v0.887l8.294,21.002c0.281,0.7,0.057,1.51-0.551,1.965c-0.301,0.229-0.658,0.344-1.013,0.344
													c-0.364,0-0.722-0.12-1.025-0.355l-41.251-31.715c-0.416-0.318-0.657-0.816-0.657-1.33c0-0.531,0.241-1.023,0.657-1.345
													l41.251-31.712c0.6-0.463,1.433-0.463,2.038-0.011c0.603,0.459,0.827,1.258,0.551,1.958l-7.776,19.694
													c0.21-0.011,0.418-0.033,0.637-0.033h47.462v-34.715c0-5.724,4.637-10.353,10.352-10.353c5.721,0,10.356,4.629,10.356,10.353
													V253.617z"/>
											</svg>
										</span>
									</div>
								</button>
							{/if}
						</div>
						{#if selectedChoice !== currentQuestion.correctAnswer}
							<p class="text-sm text-red-700">
								La bonne réponse est : <strong>{currentQuestion.correctAnswer}</strong>
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}