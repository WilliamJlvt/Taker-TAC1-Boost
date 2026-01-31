import type { Question, QuizAnswer, QuizResult } from './types.js';

export function createQuiz(
	allQuestions: Question[],
	questionCount: number = 100,
	categories: Question['category'][] = []
): Question[] {
	let filteredQuestions = allQuestions;

	if (categories.length > 0) {
		filteredQuestions = allQuestions.filter((q) => categories.includes(q.category));
	}

	const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
	const selected = shuffled.slice(0, Math.min(questionCount, filteredQuestions.length));

	return selected.map(shuffleChoices);
}

export function shuffleChoices(question: Question): Question {
	const answerOptions = [...question.answerOptions].sort(() => Math.random() - 0.5);
	return { ...question, answerOptions };
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
