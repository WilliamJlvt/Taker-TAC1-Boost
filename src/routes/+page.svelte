<script lang="ts">
	import { createQuiz } from '$lib/quiz.js';
	import { currentQuiz, currentQuestionIndex, quizAnswers, isQuizActive, quizStartTime, timeRemaining, totalTime, quizResult, currentExamMode } from '$lib/stores.js';
	import Timer from '$lib/components/Timer.svelte';
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import StartScreen from '$lib/components/StartScreen.svelte';
	import ResultScreen from '$lib/components/ResultScreen.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import type { ExamMode } from '$lib/types.js';
	import type { Session } from '@auth/core/types';

	let { data }: { data: { session: Session | null } } = $props();

	let showStartScreen = $state(true);
	let showQuiz = $state(false);
	let showResults = $state(false);

	function startQuiz(questionCount: number, timeLimit: number, categories: Question['category'][] = [], examMode: ExamMode = 'custom') {
		const quiz = createQuiz(questionCount, categories);
		currentQuiz.set(quiz);
		isQuizActive.set(true);
		quizStartTime.set(Date.now());
		timeRemaining.set(timeLimit * 60); // convert minutes to seconds
		totalTime.set(timeLimit * 60);
		currentExamMode.set(examMode);
		
		showStartScreen = false;
		showQuiz = true;
		showResults = false;
	}

	function handleQuizComplete() {
		isQuizActive.set(false);
		showQuiz = false;
		showResults = true;
	}

	function resetQuiz() {
		showStartScreen = true;
		showQuiz = false;
		showResults = false;
		currentQuiz.set([]);
		currentQuestionIndex.set(0);
		quizAnswers.set([]);
		isQuizActive.set(false);
		quizStartTime.set(null);
		timeRemaining.set(0);
		totalTime.set(0);
		quizResult.set(null);
		currentExamMode.set('custom');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="container mx-auto px-4 py-8">
		<header class="flex justify-between items-center mb-8">
			<!-- Spacer to balance UserMenu -->
			<div class="w-32 sm:w-40"></div>
			<div class="text-center flex-1">
				<h1 class="text-4xl font-bold text-gray-800 mb-2">TAC1 Boost</h1>
				<p class="text-gray-600">Révision interactive pour l'examen TAC1</p>
			</div>
			<div class="w-32 sm:w-40 flex justify-end">
				<UserMenu session={data.session} />
			</div>
		</header>

		{#if showStartScreen}
			<StartScreen {startQuiz} session={data.session} />
		{:else if showQuiz}
			<div class="max-w-4xl mx-auto">
				<div class="mb-6">
					<Timer onTimeUp={handleQuizComplete} />
				</div>
				<QuestionCard onComplete={handleQuizComplete} />
			</div>
		{:else if showResults}
			<ResultScreen {resetQuiz} session={data.session} />
		{/if}
	</div>
</div>
