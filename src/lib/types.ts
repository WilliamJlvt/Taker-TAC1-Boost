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
	examMode?: ExamMode;
}

// Official exam modes for scoreboard
export type ExamMode = 'organisationnelle' | 'tresorerie' | 'custom';

export interface ExamModeConfig {
	name: string;
	description: string;
	categories: Question['category'][];
	questionCount: number;
	timeLimit: number; // in minutes
}

export const EXAM_MODES: Record<Exclude<ExamMode, 'custom'>, ExamModeConfig> = {
	organisationnelle: {
		name: 'TAC1 Organisationnelle',
		description: 'Examen officiel incluant les questions Organisationnel, CLR et Mouvement',
		categories: ['Organisationnel', 'CLR', 'Mouvement'],
		questionCount: 50,
		timeLimit: 30
	},
	tresorerie: {
		name: 'TAC1 Trésorerie',
		description: 'Examen officiel incluant les questions Trésorerie, CLR et Mouvement',
		categories: ['Trésorerie', 'CLR', 'Mouvement'],
		questionCount: 50,
		timeLimit: 30
	}
};

// User types for auth
export interface User {
	id: string;
	email: string;
	name: string;
	image?: string | null;
}

// Leaderboard types
export interface ScoreEntry {
	id: number;
	user_id: string;
	user_name: string;
	user_image: string | null;
	score: number;
	total_questions: number;
	correct_answers: number;
	time_spent: number;
	attempt_count: number;
	created_at: string;
}
