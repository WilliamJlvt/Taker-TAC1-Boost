<script lang="ts">
	import { createQuiz } from '$lib/quiz.js';
	import {
		currentQuiz,
		currentQuestionIndex,
		quizAnswers,
		isQuizActive,
		quizStartTime,
		timeRemaining,
		totalTime,
		quizResult,
		currentExamMode
	} from '$lib/stores.js';
	import Timer from '$lib/components/Timer.svelte';
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import StartScreen from '$lib/components/StartScreen.svelte';
	import ResultScreen from '$lib/components/ResultScreen.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import logo from '$lib/assets/logo.svg';
	import type { ExamMode } from '$lib/types.js';
	import type { Session } from '@auth/core/types';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let { data }: { data: { session: Session | null } } = $props();

	let showStartScreen = $state(true);
	let showQuiz = $state(false);
	let showResults = $state(false);
	let showQuitConfirmation = $state(false);

	function startQuiz(
		questionCount: number,
		timeLimit: number,
		categories: Question['category'][] = [],
		examMode: ExamMode = 'custom'
	) {
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

		// Push a state to detect back navigation
		if (browser) {
			history.pushState({ quizActive: true }, '');
		}
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
		showQuitConfirmation = false;
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

	function openQuitConfirmation() {
		showQuitConfirmation = true;
	}

	function closeQuitConfirmation() {
		showQuitConfirmation = false;
	}

	function confirmQuit() {
		resetQuiz();
	}

	// Handle browser back button
	function handlePopState(event: PopStateEvent) {
		if (showQuiz) {
			// User pressed back during quiz - reset
			resetQuiz();
		}
	}

	// Handle page unload (closing tab, refreshing)
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (showQuiz) {
			event.preventDefault();
			return '';
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('popstate', handlePopState);
			window.addEventListener('beforeunload', handleBeforeUnload);

			// Reset state if quiz was left in an incomplete state
			// This handles navigation from profile/scoreboard pages back to home
			const isActive = $isQuizActive;
			if (!isActive && !showStartScreen) {
				// User navigated away and came back - reset to start screen
				resetQuiz();
			}
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('popstate', handlePopState);
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-white via-slate-50 to-[#122555]/5 flex flex-col">
	<div class="container mx-auto px-4 py-6 flex flex-col flex-1">
		<header class="flex justify-between items-center mb-4">
			<!-- Logo and Quit button -->
			<div class="w-32 sm:w-40 flex items-center gap-3">
				<a href="/" class="flex-shrink-0">
					<img src={logo} alt="TAC1 Boost" class="h-10 w-auto" />
				</a>
				{#if showQuiz}
					<button
						onclick={openQuitConfirmation}
						class="flex items-center gap-2 text-[#122555]/70 hover:text-[#122555] transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
						<span class="hidden sm:inline">Quitter</span>
					</button>
				{/if}
			</div>
			<div class="text-center flex-1">
				<h1 class="text-4xl font-bold text-[#122555] mb-2">TAC1 Boost</h1>
				<p class="text-[#122555]/60">Révision interactive pour l'examen TAC1</p>
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

<!-- Quit Confirmation Modal -->
{#if showQuitConfirmation}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
			<div class="text-center mb-6">
				<div
					class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-bold text-[#122555] mb-2">Quitter le quiz ?</h3>
				<p class="text-[#122555]/60">
					Votre progression sera perdue et cet essai ne sera pas comptabilisé.
				</p>
			</div>
			<div class="flex gap-3">
				<button
					onclick={closeQuitConfirmation}
					class="flex-1 py-3 px-4 border-2 border-[#122555]/20 text-[#122555] font-semibold rounded-lg hover:bg-[#122555]/5 transition-colors"
				>
					Continuer
				</button>
				<button
					onclick={confirmQuit}
					class="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
				>
					Quitter
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>
