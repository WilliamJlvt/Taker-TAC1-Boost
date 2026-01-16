import type { Question, QuizAnswer, QuizResult } from './types.js';
import { getRandomQuestions, shuffleChoices } from './data/index.js';

export function createQuiz(questionCount: number = 100, categories: Question['category'][] = []): Question[] {
	const randomQuestions = getRandomQuestions(questionCount, categories);
	return randomQuestions.map(shuffleChoices);
}

export function calculateResult(
	questions: Question[],
	answers: QuizAnswer[],
	totalTimeSpent: number
): QuizResult {
	const categoryScores: Record<string, { correct: number; total: number }> = {};
	let correctAnswers = 0;

	questions.forEach((question, index) => {
		const answer = answers[index];
		if (!categoryScores[question.category]) {
			categoryScores[question.category] = { correct: 0, total: 0 };
		}
		categoryScores[question.category].total++;
		
		if (answer && answer.isCorrect) {
			correctAnswers++;
			categoryScores[question.category].correct++;
		}
	});

	return {
		score: Math.round((correctAnswers / questions.length) * 100),
		totalQuestions: questions.length,
		timeSpent: totalTimeSpent,
		answers,
		categoryScores
	};
}

export function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}