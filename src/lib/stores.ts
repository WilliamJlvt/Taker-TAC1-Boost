import { writable } from 'svelte/store';
import type { Question, QuizAnswer, QuizResult } from './types.js';

export const currentQuiz = writable<Question[]>([]);
export const currentQuestionIndex = writable<number>(0);
export const quizAnswers = writable<QuizAnswer[]>([]);
export const quizStartTime = writable<number | null>(null);
export const timeRemaining = writable<number>(0);
export const totalTime = writable<number>(0);
export const isQuizActive = writable<boolean>(false);
export const quizResult = writable<QuizResult | null>(null);