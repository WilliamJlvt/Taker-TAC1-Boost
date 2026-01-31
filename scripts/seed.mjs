import Database from 'better-sqlite3';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const dbPath = process.env.DATABASE_PATH || resolve(process.cwd(), 'data', 'tac1.db');
const outputPath = resolve(process.cwd(), 'data', 'seed', 'seed-questions.csv');

const db = new Database(dbPath);

const rows = db
	.prepare(
		`
    SELECT
      q.id AS question_id,
      c.slug AS category_slug,
      c.name AS category_name,
      q.question_text,
      ao.position AS answer_position,
      ao.text AS answer_text,
      ao.is_correct AS is_correct,
      ao.rationale AS rationale
    FROM questions q
    JOIN categories c ON c.id = q.category_id
    JOIN answer_options ao ON ao.question_id = q.id
    ORDER BY q.id, ao.position
  `
	)
	.all();

const escapeCsv = (value) => {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (/[",\n]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
};

const header = [
	'question_id',
	'category_slug',
	'category_name',
	'question_text',
	'answer_position',
	'answer_text',
	'is_correct',
	'rationale'
];

const lines = [header.join(',')];
for (const row of rows) {
	lines.push(
		[
			row.question_id,
			row.category_slug,
			row.category_name,
			row.question_text,
			row.answer_position,
			row.answer_text,
			row.is_correct,
			row.rationale
		]
			.map(escapeCsv)
			.join(',')
	);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, lines.join('\n'), 'utf8');

console.log(`Seed CSV written to ${outputPath}`);
