export interface Question {
	id: string;
	question: string;
	choices: string[];
	correctAnswer: string;
	category: 'CLR' | 'Mouvement' | 'Organisationnel';
}

export interface QuizAnswer {
	questionId: string;
	selectedAnswer: string;
	isCorrect: boolean;
	timeSpent: number;
}

export interface QuizResult {
	score: number;
	totalQuestions: number;
	timeSpent: number;
	answers: QuizAnswer[];
	categoryScores: Record<string, { correct: number; total: number }>;
}

export interface QuizConfig {
	totalQuestions: number;
	timeLimit: number; // in minutes
	categories: Question['category'][];
}