import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { env } from '$env/dynamic/private';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = env.DATABASE_PATH || join(__dirname, '../../../data/tac1.db');

// Ensure data directory exists
const dataDir = dirname(dbPath);
if (!existsSync(dataDir)) {
	mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Run migrations
const schemaPath = join(__dirname, 'schema.sql');
if (existsSync(schemaPath)) {
	const schema = readFileSync(schemaPath, 'utf-8');
	db.exec(schema);
}

// Seed fixed categories
const fixedCategories = [
	{ name: 'Mouvement', slug: 'mouvement' },
	{ name: 'CLR', slug: 'clr' },
	{ name: 'Organisationnel', slug: 'organisationnel' },
	{ name: 'Trésorerie', slug: 'tresorerie' }
];

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, slug) VALUES (@name, @slug)');
for (const cat of fixedCategories) {
	insertCategory.run(cat);
}

export interface DbUser {
	id: string;
	email: string;
	name: string;
	image: string | null;
	created_at?: string;
}

export interface DbScore {
	id: number;
	user_id: string;
	exam_mode: 'organisationnelle' | 'tresorerie';
	score: number;
	total_questions: number;
	correct_answers: number;
	time_spent: number;
	category_scores: string;
	created_at: string;
}

export interface DbCategory {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	created_at: string;
}

export interface DbQuestion {
	id: number;
	category_id: number;
	question_text: string;
	created_at: string;
	updated_at: string;
}

export interface DbAnswerOption {
	id: number;
	question_id: number;
	text: string;
	is_correct: number; // SQLite uses 0/1 for booleans
	rationale: string | null;
	position: number;
}

export function isAdmin(email?: string | null): boolean {
	if (!email) return false;
	const adminEmails = (env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
	return adminEmails.includes(email.toLowerCase());
}

export function getOrCreateUser(user: Omit<DbUser, 'created_at'>): DbUser {
	const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(user.email) as DbUser | undefined;
	if (existing) {
		db.prepare('UPDATE users SET id = ?, name = ?, image = ? WHERE email = ?').run(
			user.id, user.name, user.image, user.email
		);
		return { ...existing, id: user.id, name: user.name, image: user.image };
	}

	db.prepare('INSERT INTO users (id, email, name, image) VALUES (?, ?, ?, ?)').run(
		user.id,
		user.email,
		user.name,
		user.image
	);
	return user as DbUser;
}

export function saveScore(score: Omit<DbScore, 'id' | 'created_at'>): DbScore {
	const stmt = db.prepare(`
		INSERT INTO scores (user_id, exam_mode, score, total_questions, correct_answers, time_spent, category_scores)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`);
	const result = stmt.run(
		score.user_id,
		score.exam_mode,
		score.score,
		score.total_questions,
		score.correct_answers,
		score.time_spent,
		score.category_scores
	);

	return {
		...score,
		id: result.lastInsertRowid as number,
		created_at: new Date().toISOString()
	};
}

export interface LeaderboardEntry {
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

export function getLeaderboard(examMode: 'organisationnelle' | 'tresorerie', limit = 20): LeaderboardEntry[] {
	return db.prepare(`
		SELECT 
			s.id, s.user_id, u.name as user_name, u.image as user_image,
			s.score, s.total_questions, s.correct_answers, s.time_spent, s.created_at,
			(SELECT COUNT(*) FROM scores s3 WHERE s3.user_id = s.user_id AND s3.exam_mode = s.exam_mode) as attempt_count
		FROM scores s
		JOIN users u ON s.user_id = u.id
		WHERE s.exam_mode = ?
		AND s.id = (
			SELECT s2.id FROM scores s2 
			WHERE s2.user_id = s.user_id AND s2.exam_mode = s.exam_mode
			ORDER BY s2.score DESC, s2.time_spent ASC 
			LIMIT 1
		)
		ORDER BY s.score DESC, s.time_spent ASC
		LIMIT ?
	`).all(examMode, limit) as LeaderboardEntry[];
}

export function getUserScores(userId: string, examMode?: string): DbScore[] {
	if (examMode) {
		return db.prepare('SELECT * FROM scores WHERE user_id = ? AND exam_mode = ? ORDER BY created_at DESC').all(userId, examMode) as DbScore[];
	}
	return db.prepare('SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC').all(userId) as DbScore[];
}

export interface UserStats {
	totalAttempts: number;
	bestScoreOrga: number | null;
	bestScoreTreso: number | null;
	avgScore: number;
	categoryStats: Record<string, { correct: number; total: number; percentage: number }>;
	progression: {
		organisationnelle: { date: string; score: number }[];
		tresorerie: { date: string; score: number }[];
	};
	recentAttempts: DbScore[];
}

export function getUserStats(userId: string): UserStats {
	const allScores = db.prepare('SELECT * FROM scores WHERE user_id = ? ORDER BY created_at ASC').all(userId) as DbScore[];

	// Calculate stats
	const totalAttempts = allScores.length;
	const orgaScores = allScores.filter(s => s.exam_mode === 'organisationnelle');
	const tresoScores = allScores.filter(s => s.exam_mode === 'tresorerie');

	const bestScoreOrga = orgaScores.length > 0 ? Math.max(...orgaScores.map(s => s.score)) : null;
	const bestScoreTreso = tresoScores.length > 0 ? Math.max(...tresoScores.map(s => s.score)) : null;
	const avgScore = totalAttempts > 0 ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / totalAttempts) : 0;

	// Aggregate category stats
	const categoryStats: Record<string, { correct: number; total: number; percentage: number }> = {};
	for (const score of allScores) {
		if (score.category_scores) {
			try {
				const cats = JSON.parse(score.category_scores) as Record<string, { correct: number; total: number }>;
				for (const [cat, data] of Object.entries(cats)) {
					if (!categoryStats[cat]) {
						categoryStats[cat] = { correct: 0, total: 0, percentage: 0 };
					}
					categoryStats[cat].correct += data.correct;
					categoryStats[cat].total += data.total;
				}
			} catch (e) {
				// Ignore malformed JSON
			}
		}
	}

	// Calculate percentages
	for (const cat of Object.keys(categoryStats)) {
		const { correct, total } = categoryStats[cat];
		categoryStats[cat].percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
	}

	// Progression data for charts
	const progression = {
		organisationnelle: orgaScores.map(s => ({
			date: s.created_at,
			score: s.score
		})),
		tresorerie: tresoScores.map(s => ({
			date: s.created_at,
			score: s.score
		}))
	};

	// Recent attempts (last 10)
	const recentAttempts = allScores.slice(-10).reverse();

	return {
		totalAttempts,
		bestScoreOrga,
		bestScoreTreso,
		avgScore,
		categoryStats,
		progression,
		recentAttempts
	};
}

// --- Admin Functions ---

export function getCategories(): DbCategory[] {
	return db.prepare('SELECT * FROM categories ORDER BY name ASC').all() as DbCategory[];
}

export function createCategory(data: { name: string; slug: string; description?: string }): number {
	const info = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)')
		.run(data.name, data.slug, data.description || null);
	return info.lastInsertRowid as number;
}

export interface QuestionFilter {
	categoryId?: number;
	search?: string;
	limit?: number;
	offset?: number;
}

export function getQuestions(filter: QuestionFilter = {}): (DbQuestion & { category_name: string, answer_count: number })[] {
	let query = `
		SELECT q.*, c.name as category_name,
		(SELECT COUNT(*) FROM answer_options WHERE question_id = q.id) as answer_count
		FROM questions q
		JOIN categories c ON q.category_id = c.id
		WHERE 1=1
	`;
	const params: any[] = [];

	if (filter.categoryId) {
		query += ' AND q.category_id = ?';
		params.push(filter.categoryId);
	}

	if (filter.search) {
		query += ' AND q.question_text LIKE ?';
		params.push(`%${filter.search}%`);
	}

	query += ' ORDER BY q.created_at DESC';

	if (filter.limit) {
		query += ' LIMIT ?';
		params.push(filter.limit);
		if (filter.offset) {
			query += ' OFFSET ?';
			params.push(filter.offset);
		}
	}

	return db.prepare(query).all(...params) as (DbQuestion & { category_name: string, answer_count: number })[];
}

export function getQuestion(id: number): (DbQuestion & { answers: DbAnswerOption[] }) | undefined {
	const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as DbQuestion | undefined;
	if (!question) return undefined;

	const answers = db.prepare('SELECT * FROM answer_options WHERE question_id = ? ORDER BY position ASC, id ASC').all(id) as DbAnswerOption[];
	return { ...question, answers };
}

export interface QuestionData {
	categoryId: number;
	questionText: string;
	answers: {
		text: string;
		isCorrect: boolean;
		rationale?: string;
	}[];
}

export function createQuestion(data: QuestionData): number {
	const insertQuestion = db.prepare('INSERT INTO questions (category_id, question_text) VALUES (?, ?)');
	const insertAnswer = db.prepare('INSERT INTO answer_options (question_id, text, is_correct, rationale, position) VALUES (?, ?, ?, ?, ?)');

	const createTx = db.transaction((questionData: QuestionData) => {
		const info = insertQuestion.run(questionData.categoryId, questionData.questionText);
		const questionId = info.lastInsertRowid as number;

		questionData.answers.forEach((ans, index) => {
			insertAnswer.run(questionId, ans.text, ans.isCorrect ? 1 : 0, ans.rationale || null, index);
		});

		return questionId;
	});

	return createTx(data);
}

export function updateQuestion(id: number, data: QuestionData): void {
	const updateQuestionStmt = db.prepare('UPDATE questions SET category_id = ?, question_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
	const deleteAnswers = db.prepare('DELETE FROM answer_options WHERE question_id = ?');
	const insertAnswer = db.prepare('INSERT INTO answer_options (question_id, text, is_correct, rationale, position) VALUES (?, ?, ?, ?, ?)');

	const updateTx = db.transaction((qId: number, questionData: QuestionData) => {
		updateQuestionStmt.run(questionData.categoryId, questionData.questionText, qId);
		deleteAnswers.run(qId);
		questionData.answers.forEach((ans, index) => {
			insertAnswer.run(qId, ans.text, ans.isCorrect ? 1 : 0, ans.rationale || null, index);
		});
	});

	updateTx(id, data);
}

export function deleteQuestion(id: number): void {
	db.prepare('DELETE FROM questions WHERE id = ?').run(id);
}

export function importQuestionsFromJSON(jsonContent: any, categoryId: number): { added: number; errors: string[] } {
	// Expects an array of question objects based on the index.ts transformData structure or raw JSON
	// We handle the structure: { question: string, answerOptions: { text: string, isCorrect: boolean, rationale?: string }[] }

	if (!Array.isArray(jsonContent)) {
		return { added: 0, errors: ['JSON content must be an array'] };
	}

	let added = 0;
	const errors: string[] = [];

	const insertQuestion = db.prepare('INSERT INTO questions (category_id, question_text) VALUES (?, ?)');
	const insertAnswer = db.prepare('INSERT INTO answer_options (question_id, text, is_correct, rationale, position) VALUES (?, ?, ?, ?, ?)');

	const importTx = db.transaction((questions: any[]) => {
		for (let i = 0; i < questions.length; i++) {
			const q = questions[i];
			if (!q.question || !Array.isArray(q.answerOptions)) {
				errors.push(`Question at index ${i} is missing required fields`);
				continue;
			}

			try {
				const info = insertQuestion.run(categoryId, q.question);
				const qId = info.lastInsertRowid as number;

				q.answerOptions.forEach((ans: any, idx: number) => {
					insertAnswer.run(qId, ans.text, ans.isCorrect ? 1 : 0, ans.rationale || null, idx);
				});
				added++;
			} catch (e: any) {
				errors.push(`Error saving question at index ${i}: ${e.message}`);
			}
		}
	});

	importTx(jsonContent);
	return { added, errors };
}

export function getAllQuestionsWithAnswers(): any[] {
	const questions = db.prepare('SELECT * FROM questions').all() as DbQuestion[];
	const answers = db.prepare('SELECT * FROM answer_options ORDER BY position ASC').all() as DbAnswerOption[];
	const categories = db.prepare('SELECT * FROM categories').all() as DbCategory[];

	const catMap = new Map(categories.map(c => [c.id, c.name]));

	return questions.map(q => {
		const qAnswers = answers.filter(a => a.question_id === q.id).map(a => ({
			text: a.text,
			isCorrect: a.is_correct === 1,
			rationale: a.rationale || undefined
		}));

		return {
			id: q.id.toString(),
			question: q.question_text,
			answerOptions: qAnswers,
			category: catMap.get(q.category_id)
		};
	});
}
