import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { env } from '$env/dynamic/private';

import schema from './schema.sql?raw';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = env.DATABASE_PATH || join(__dirname, '../../../data/tac1.db');

// Ensure data directory exists
const dataDir = dirname(dbPath);
if (!existsSync(dataDir)) {
	mkdirSync(dataDir, { recursive: true });
}

let _db: Database.Database | undefined;

export function getDb(): Database.Database {
	if (_db) return _db;

	_db = new Database(dbPath);
	_db.pragma('journal_mode = WAL');

	// Run migrations
	_db.exec(schema);

	// Migration for new user role column
	try {
		_db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run();
	} catch {
		// Column probably already exists
	}

	// Migration for new question stats columns
	try {
		_db.prepare('ALTER TABLE questions ADD COLUMN success_count INTEGER DEFAULT 0').run();
		_db.prepare('ALTER TABLE questions ADD COLUMN failure_count INTEGER DEFAULT 0').run();
	} catch {
		// Columns probably already exist
	}

	// Seed fixed categories
	const fixedCategories = [
		{ name: 'Mouvement', slug: 'mouvement' },
		{ name: 'CLR', slug: 'clr' },
		{ name: 'Organisationnel', slug: 'organisationnel' },
		{ name: 'Trésorerie', slug: 'tresorerie' }
	];

	const insertCategory = _db.prepare(
		'INSERT OR IGNORE INTO categories (name, slug) VALUES (@name, @slug)'
	);
	for (const cat of fixedCategories) {
		insertCategory.run(cat);
	}

	return _db;
}

// Global db export for backward compatibility where possible, but use getDb() for actual access
export const db = {} as Record<string, unknown>;

export interface DbUser {
	id: string;
	email: string;
	name: string;
	image: string | null;
	role: 'admin' | 'user';
	created_at?: string;
}

export interface DbScore {
	id: number;
	user_id: string;
	exam_mode: 'organisationnel' | 'tresorerie';
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
	success_count: number;
	failure_count: number;
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

	// Hardcoded fallback for bootstrap/security
	const adminEmails = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
	if (adminEmails.includes(email.toLowerCase())) return true;

	const user = getDb()
		.prepare('SELECT role FROM users WHERE email = ?')
		.get(email.toLowerCase()) as { role: string } | undefined;

	return user?.role === 'admin';
}

export function getOrCreateUser(user: Omit<DbUser, 'created_at' | 'role'>): DbUser {
	const existing = getDb().prepare('SELECT * FROM users WHERE email = ?').get(user.email) as
		| DbUser
		| undefined;
	if (existing) {
		// If user ID changed, update the FK references in scores table first
		if (existing.id !== user.id) {
			// Disable foreign keys before the transaction (must be outside transaction)
			getDb().pragma('foreign_keys = OFF');
			try {
				getDb()
					.prepare('UPDATE scores SET user_id = ? WHERE user_id = ?')
					.run(user.id, existing.id);
				getDb()
					.prepare('UPDATE users SET id = ?, name = ?, image = ? WHERE email = ?')
					.run(user.id, user.name, user.image, user.email);
			} finally {
				getDb().pragma('foreign_keys = ON');
			}
		} else {
			getDb()
				.prepare('UPDATE users SET name = ?, image = ? WHERE email = ?')
				.run(user.name, user.image, user.email);
		}
		return { ...existing, id: user.id, name: user.name, image: user.image };
	}

	// Automatic admin promotion if email is in ADMIN_EMAILS
	const adminEmails = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
	const role = adminEmails.includes(user.email.toLowerCase()) ? 'admin' : 'user';

	getDb()
		.prepare('INSERT INTO users (id, email, name, image, role) VALUES (?, ?, ?, ?, ?)')
		.run(user.id, user.email, user.name, user.image, role);
	return { ...user, role } as DbUser;
}

export function getAllUsers(): (DbUser & { isHardcodedAdmin: boolean })[] {
	const users = (
		getDb().prepare('SELECT * FROM users ORDER BY created_at DESC').all() as DbUser[]
	).map((u) => ({
		...u,
		role: u.role || 'user'
	}));
	const adminEmails = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());

	return users.map((user) => ({
		...user,
		// We flag if it's a hardcoded admin so we can prevent role changes in UI?
		// Or just to show they have special "super-admin" status.
		isHardcodedAdmin: adminEmails.includes(user.email.toLowerCase())
	}));
}

export function updateUserRole(userId: string, role: string): boolean {
	const result = getDb().prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
	return result.changes > 0;
}

export function deleteUser(userId: string): boolean {
	const result = getDb().prepare('DELETE FROM users WHERE id = ?').run(userId);
	// Optional: Cascade delete scores? SQLite typically handles this via ON DELETE CASCADE if configured.
	// Check schema.sql if scores ref users. Our schema calls it `user_id TEXT NOT NULL REFERENCES users(id)`
	// but default SQLite might not enforce FKs unless PRAGMA foreign_keys = ON; is set (it is not in db.ts currently).
	// Let's manually clean up scores just in case for now.
	if (result.changes > 0) {
		getDb().prepare('DELETE FROM scores WHERE user_id = ?').run(userId);
		return true;
	}
	return false;
}

export function saveScore(score: Omit<DbScore, 'id' | 'created_at'>): DbScore {
	const stmt = getDb().prepare(`
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

export function getLeaderboard(
	examMode: 'organisationnel' | 'tresorerie',
	limit = 20
): LeaderboardEntry[] {
	return getDb()
		.prepare(
			`
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
	`
		)
		.all(examMode, limit) as LeaderboardEntry[];
}

export function getUserScores(userId: string, examMode?: string): DbScore[] {
	if (examMode) {
		return getDb()
			.prepare('SELECT * FROM scores WHERE user_id = ? AND exam_mode = ? ORDER BY created_at DESC')
			.all(userId, examMode) as DbScore[];
	}
	return getDb()
		.prepare('SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC')
		.all(userId) as DbScore[];
}

export interface UserStats {
	totalAttempts: number;
	bestScoreOrga: number | null;
	bestScoreTreso: number | null;
	avgScore: number;
	categoryStats: Record<string, { correct: number; total: number; percentage: number }>;
	progression: {
		organisationnel: { date: string; score: number }[];
		tresorerie: { date: string; score: number }[];
	};
	recentAttempts: DbScore[];
}

export function getUserStats(userId: string): UserStats {
	const allScores = getDb()
		.prepare('SELECT * FROM scores WHERE user_id = ? ORDER BY created_at ASC')
		.all(userId) as DbScore[];

	// Calculate stats
	const totalAttempts = allScores.length;
	const orgaScores = allScores.filter((s) => s.exam_mode === 'organisationnel');
	const tresoScores = allScores.filter((s) => s.exam_mode === 'tresorerie');

	const bestScoreOrga = orgaScores.length > 0 ? Math.max(...orgaScores.map((s) => s.score)) : null;
	const bestScoreTreso =
		tresoScores.length > 0 ? Math.max(...tresoScores.map((s) => s.score)) : null;
	const avgScore =
		totalAttempts > 0
			? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / totalAttempts)
			: 0;

	// Aggregate category stats
	const categoryStats: Record<string, { correct: number; total: number; percentage: number }> = {};
	for (const score of allScores) {
		if (score.category_scores) {
			try {
				const cats = JSON.parse(score.category_scores) as Record<
					string,
					{ correct: number; total: number }
				>;
				for (const [cat, data] of Object.entries(cats)) {
					if (!categoryStats[cat]) {
						categoryStats[cat] = { correct: 0, total: 0, percentage: 0 };
					}
					categoryStats[cat].correct += data.correct;
					categoryStats[cat].total += data.total;
				}
			} catch {
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
		organisationnel: orgaScores.map((s) => ({
			date: s.created_at,
			score: s.score
		})),
		tresorerie: tresoScores.map((s) => ({
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
	return getDb().prepare('SELECT * FROM categories ORDER BY name ASC').all() as DbCategory[];
}

export function createCategory(data: { name: string; slug: string; description?: string }): number {
	const info = getDb()
		.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)')
		.run(data.name, data.slug, data.description || null);
	return info.lastInsertRowid as number;
}

export interface QuestionFilter {
	categoryId?: number;
	search?: string;
	limit?: number;
	offset?: number;
}

export function getQuestions(
	filter: QuestionFilter = {}
): (DbQuestion & { category_name: string; answer_count: number })[] {
	let query = `
		SELECT q.*, c.name as category_name,
		(SELECT COUNT(*) FROM answer_options WHERE question_id = q.id) as answer_count
		FROM questions q
		JOIN categories c ON q.category_id = c.id
		WHERE 1=1
	`;
	const params: (string | number)[] = [];

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

	return getDb()
		.prepare(query)
		.all(...params) as (DbQuestion & { category_name: string; answer_count: number })[];
}

export function getQuestion(id: number): (DbQuestion & { answers: DbAnswerOption[] }) | undefined {
	const question = getDb().prepare('SELECT * FROM questions WHERE id = ?').get(id) as
		| DbQuestion
		| undefined;
	if (!question) return undefined;

	const answers = getDb()
		.prepare('SELECT * FROM answer_options WHERE question_id = ? ORDER BY position ASC, id ASC')
		.all(id) as DbAnswerOption[];
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
	const insertQuestion = getDb().prepare(
		'INSERT INTO questions (category_id, question_text) VALUES (?, ?)'
	);
	const insertAnswer = getDb().prepare(
		'INSERT INTO answer_options (question_id, text, is_correct, rationale, position) VALUES (?, ?, ?, ?, ?)'
	);

	const createTx = getDb().transaction((questionData: QuestionData) => {
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
	const updateQuestionStmt = getDb().prepare(
		'UPDATE questions SET category_id = ?, question_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
	);
	const deleteAnswers = getDb().prepare('DELETE FROM answer_options WHERE question_id = ?');
	const insertAnswer = getDb().prepare(
		'INSERT INTO answer_options (question_id, text, is_correct, rationale, position) VALUES (?, ?, ?, ?, ?)'
	);

	const updateTx = getDb().transaction((qId: number, questionData: QuestionData) => {
		updateQuestionStmt.run(questionData.categoryId, questionData.questionText, qId);
		deleteAnswers.run(qId);
		questionData.answers.forEach((ans, index) => {
			insertAnswer.run(qId, ans.text, ans.isCorrect ? 1 : 0, ans.rationale || null, index);
		});
	});

	updateTx(id, data);
}

export function deleteQuestion(id: number): void {
	getDb().prepare('DELETE FROM questions WHERE id = ?').run(id);
}

export function importQuestionsFromJSON(
	jsonContent: unknown,
	categoryId: number
): { added: number; errors: string[] } {
	// Expects an array of question objects based on the index.ts transformData structure or raw JSON
	// We handle the structure: { question: string, answerOptions: { text: string, isCorrect: boolean, rationale?: string }[] }

	if (!Array.isArray(jsonContent)) {
		return { added: 0, errors: ['JSON content must be an array'] };
	}

	let added = 0;
	const errors: string[] = [];

	const insertQuestion = getDb().prepare(
		'INSERT INTO questions (category_id, question_text) VALUES (?, ?)'
	);
	const insertAnswer = getDb().prepare(
		'INSERT INTO answer_options (question_id, text, is_correct, rationale, position) VALUES (?, ?, ?, ?, ?)'
	);

	const importTx = getDb().transaction(
		(
			questions: {
				question: string;
				answerOptions: { text: string; isCorrect: boolean; rationale?: string }[];
			}[]
		) => {
			for (let i = 0; i < questions.length; i++) {
				const q = questions[i];
				if (!q.question || !Array.isArray(q.answerOptions)) {
					errors.push(`Question at index ${i} is missing required fields`);
					continue;
				}

				try {
					const info = insertQuestion.run(categoryId, q.question);
					const qId = info.lastInsertRowid as number;

					q.answerOptions.forEach((ans, idx: number) => {
						insertAnswer.run(qId, ans.text, ans.isCorrect ? 1 : 0, ans.rationale || null, idx);
					});
					added++;
				} catch (e: unknown) {
					const message = e instanceof Error ? e.message : 'Unknown error';
					errors.push(`Error saving question at index ${i}: ${message}`);
				}
			}
		}
	);

	importTx(jsonContent);
	return { added, errors };
}

export interface QuestionWithAnswers {
	id: string;
	question: string;
	answerOptions: {
		text: string;
		isCorrect: boolean;
		rationale?: string;
	}[];
	category: string | undefined;
}

export function getAllQuestionsWithAnswers(): QuestionWithAnswers[] {
	const questions = getDb().prepare('SELECT * FROM questions').all() as DbQuestion[];
	const answers = getDb()
		.prepare('SELECT * FROM answer_options ORDER BY position ASC')
		.all() as DbAnswerOption[];
	const categories = getDb().prepare('SELECT * FROM categories').all() as DbCategory[];

	const catMap = new Map(categories.map((c) => [c.id, c.name]));

	return questions.map((q) => {
		const qAnswers = answers
			.filter((a) => a.question_id === q.id)
			.map((a) => ({
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

export function updateQuestionStats(results: { questionId: string; isCorrect: boolean }[]) {
	const updateSuccess = getDb().prepare(
		'UPDATE questions SET success_count = success_count + 1 WHERE id = ?'
	);
	const updateFailure = getDb().prepare(
		'UPDATE questions SET failure_count = failure_count + 1 WHERE id = ?'
	);

	const tx = getDb().transaction((items: { questionId: string; isCorrect: boolean }[]) => {
		for (const item of items) {
			if (item.isCorrect) {
				updateSuccess.run(item.questionId);
			} else {
				updateFailure.run(item.questionId);
			}
		}
	});

	tx(results);
}

export interface DashboardStats {
	dailyParticipation: { date: string; count: number }[];
	avgScoreEvolution: {
		organisationnel: { date: string; score: number }[];
		tresorerie: { date: string; score: number }[];
	};
	categoryPerformance: { name: string; successRate: number; totalQuestions: number }[];
	topQuestions: { question: string; successRate: number; count: number }[];
	flopQuestions: { question: string; successRate: number; count: number }[];
}

export function getDashboardStats(): DashboardStats {
	// 1. Daily Participation (Last 30 days)
	const dailyParticipation = getDb()
		.prepare(
			`
		SELECT date(created_at) as date, COUNT(*) as count 
		FROM scores 
		WHERE created_at >= date('now', '-30 days')
		GROUP BY date(created_at) 
		ORDER BY date ASC
	`
		)
		.all() as { date: string; count: number }[];

	// 2. Avg Score Evolution (Last 30 days, by mode)
	const scores = getDb()
		.prepare(
			`
		SELECT date(created_at) as date, exam_mode, AVG(score) as avg_score
		FROM scores
		WHERE created_at >= date('now', '-30 days')
		GROUP BY date(created_at), exam_mode
		ORDER BY date ASC
	`
		)
		.all() as { date: string; exam_mode: string; avg_score: number }[];

	const avgScoreEvolution = {
		organisationnel: scores
			.filter((s) => s.exam_mode === 'organisationnel')
			.map((s) => ({ date: s.date, score: Math.round(s.avg_score) })),
		tresorerie: scores
			.filter((s) => s.exam_mode === 'tresorerie')
			.map((s) => ({ date: s.date, score: Math.round(s.avg_score) }))
	};

	// 3. Category Performance (Aggregated from question stats)
	// We join questions with categories and sum up success/failure counts
	const catStats = getDb()
		.prepare(
			`
		SELECT c.name, SUM(q.success_count) as success, SUM(q.failure_count) as failure
		FROM questions q
		JOIN categories c ON q.category_id = c.id
		GROUP BY c.id
	`
		)
		.all() as { name: string; success: number; failure: number }[];

	const categoryPerformance = catStats
		.map((c) => {
			const total = c.success + c.failure;
			return {
				name: c.name,
				successRate: total > 0 ? Math.round((c.success / total) * 100) : 0,
				totalQuestions: total
			};
		})
		.sort((a, b) => b.successRate - a.successRate); // Best categories first

	// 4. Top/Flop Questions
	// We select questions with at least 1 attempt
	const questions = getDb()
		.prepare(
			`
		SELECT question_text as question, success_count, failure_count
		FROM questions
		WHERE (success_count + failure_count) >= 1
	`
		)
		.all() as { question: string; success_count: number; failure_count: number }[];

	const processedQuestions = questions.map((q) => {
		const total = q.success_count + q.failure_count;
		return {
			question: q.question,
			successRate: total > 0 ? Math.round((q.success_count / total) * 100) : 0,
			count: total
		};
	});

	// Top 3 (Highest Success Rate)
	const topQuestions = [...processedQuestions]
		.sort((a, b) => b.successRate - a.successRate || b.count - a.count)
		.slice(0, 3);

	// Flop 3 (Lowest Success Rate)
	const flopQuestions = [...processedQuestions]
		.sort((a, b) => a.successRate - b.successRate || b.count - a.count)
		.slice(0, 3);

	return {
		dailyParticipation,
		avgScoreEvolution,
		categoryPerformance,
		topQuestions,
		flopQuestions
	};
}
