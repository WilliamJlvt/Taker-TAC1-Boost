import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../../data/tac1.db');

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

export function getOrCreateUser(user: Omit<DbUser, 'created_at'>): DbUser {
	const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as DbUser | undefined;
	if (existing) {
		// Update user info in case it changed
		db.prepare('UPDATE users SET name = ?, image = ? WHERE id = ?').run(user.name, user.image, user.id);
		return { ...existing, name: user.name, image: user.image };
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
	created_at: string;
}

export function getLeaderboard(examMode: 'organisationnelle' | 'tresorerie', limit = 20): LeaderboardEntry[] {
	return db.prepare(`
		SELECT 
			s.id, s.user_id, u.name as user_name, u.image as user_image,
			s.score, s.total_questions, s.correct_answers, s.time_spent, s.created_at
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
