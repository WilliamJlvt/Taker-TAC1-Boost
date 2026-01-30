import { writable } from 'svelte/store';
import type { Question, QuizAnswer, QuizResult, ExamMode } from './types.js';

export const currentQuiz = writable<Question[]>([]);
export const currentQuestionIndex = writable<number>(0);
export const quizAnswers = writable<QuizAnswer[]>([]);
export const quizStartTime = writable<number | null>(null);
export const timeRemaining = writable<number>(0);
export const totalTime = writable<number>(0);
export const isQuizActive = writable<boolean>(false);
export const quizResult = writable<QuizResult | null>(null);
export const currentExamMode = writable<ExamMode>('custom');

// Function to reset all quiz state - call this on navigation
export function resetQuizState() {
    currentQuiz.set([]);
    currentQuestionIndex.set(0);
    quizAnswers.set([]);
    quizStartTime.set(null);
    timeRemaining.set(0);
    totalTime.set(0);
    isQuizActive.set(false);
    quizResult.set(null);
    currentExamMode.set('custom');
}