import type { Question } from '../types.js';
import clrData from './Questions TAC1 - extracted_questions_Master_CLR.csv?raw';
import mouvementData from './Questions TAC1 - extracted_questions_Master_Mouvement.csv?raw';
import organisationnelData from './Questions TAC1 - extracted_questions_Master_Organisationnel.csv?raw';

function parseCsvData(csvData: string, category: Question['category']): Question[] {
	const lines = csvData.trim().split('\n');
	const questions: Question[] = [];
	
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line.trim()) continue;
		
		// Parse CSV with proper quote handling
		const parts = parseCsvLine(line);
		if (parts.length < 3) continue;
		
		const question = parts[0];
		const choices = parts[1].split(';');
		const correctAnswer = parts[2];
		
		if (question && choices.length > 0 && correctAnswer) {
			questions.push({
				id: `${category}_${i}`,
				question: question.trim(),
				choices: choices.map(c => c.trim()),
				correctAnswer: correctAnswer.trim(),
				category
			});
		}
	}
	
	return questions;
}

function parseCsvLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;
	
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		
		if (char === '"') {
			// Handle escaped quotes
			if (i + 1 < line.length && line[i + 1] === '"') {
				current += '"';
				i++; // skip next quote
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			result.push(current);
			current = '';
		} else {
			current += char;
		}
	}
	
	// Add the last field
	result.push(current);
	
	return result;
}

export const questions: Question[] = [
	...parseCsvData(clrData, 'CLR'),
	...parseCsvData(mouvementData, 'Mouvement'),
	...parseCsvData(organisationnelData, 'Organisationnel')
];

export function getRandomQuestions(count: number = 100): Question[] {
	const shuffled = [...questions].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.min(count, questions.length));
}

export function shuffleChoices(question: Question): Question {
	const choices = [...question.choices].sort(() => Math.random() - 0.5);
	return { ...question, choices };
}