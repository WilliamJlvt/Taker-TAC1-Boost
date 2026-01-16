import type { Question } from '../types.js';
import clrData from './questions-clr.json';
import mouvementData from './questions-mouvement.json';
import organisationnelData from './questions-organisationnel.json';
import tresorerieData from './questions-tresorerie.json';

// Helper to transform raw JSON to Question type with ID and Category
function transformData(data: any[], category: Question['category']): Question[] {
	return data.map((q, index) => ({
		id: `${category}_${index}`,
		question: q.question,
		answerOptions: q.answerOptions.map((opt: any) => ({
			text: opt.text,
			isCorrect: opt.isCorrect,
			rationale: opt.rationale
		})),
		category
	}));
}

export const questions: Question[] = [
	...transformData(clrData, 'CLR'),
	...transformData(mouvementData, 'Mouvement'),
	...transformData(organisationnelData, 'Organisationnel'),
	...transformData(tresorerieData, 'Trésorerie')
];

export function getRandomQuestions(count: number = 100, categories: Question['category'][] = []): Question[] {
	let filteredQuestions = questions;
	
	if (categories.length > 0) {
		filteredQuestions = questions.filter(q => categories.includes(q.category));
	}

	const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.min(count, filteredQuestions.length));
}

export function shuffleChoices(question: Question): Question {
	const answerOptions = [...question.answerOptions].sort(() => Math.random() - 0.5);
	return { ...question, answerOptions };
}
