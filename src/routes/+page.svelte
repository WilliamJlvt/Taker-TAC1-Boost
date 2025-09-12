<script lang="ts">
	import { createQuiz } from '$lib/quiz.js';
	import { currentQuiz, isQuizActive, quizStartTime, timeRemaining, totalTime } from '$lib/stores.js';
	import Timer from '$lib/components/Timer.svelte';
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import StartScreen from '$lib/components/StartScreen.svelte';
	import ResultScreen from '$lib/components/ResultScreen.svelte';

	let showStartScreen = $state(true);
	let showQuiz = $state(false);
	let showResults = $state(false);

	function startQuiz(questionCount: number, timeLimit: number) {
		const quiz = createQuiz(questionCount);
		currentQuiz.set(quiz);
		isQuizActive.set(true);
		quizStartTime.set(Date.now());
		timeRemaining.set(timeLimit * 60); // convert minutes to seconds
		totalTime.set(timeLimit * 60);
		
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
		isQuizActive.set(false);
		quizStartTime.set(null);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="container mx-auto px-4 py-8">
		<header class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-800 mb-2">TAC1 Boost</h1>
			<p class="text-gray-600">Révision interactive pour l'examen TAC1</p>
		</header>

		{#if showStartScreen}
			<StartScreen {startQuiz} />
		{:else if showQuiz}
			<div class="max-w-4xl mx-auto">
				<div class="mb-6">
					<Timer onTimeUp={handleQuizComplete} />
				</div>
				<QuestionCard onComplete={handleQuizComplete} />
			</div>
		{:else if showResults}
			<ResultScreen {resetQuiz} />
		{/if}
	</div>
</div>
