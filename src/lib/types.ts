export interface AnswerOption {
	text: string;
	isCorrect: boolean;
	rationale?: string;
}

export interface Question {
	id: string;
	question: string;
	answerOptions: AnswerOption[];
	category: 'CLR' | 'Mouvement' | 'Organisationnel' | 'Trésorerie';
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
