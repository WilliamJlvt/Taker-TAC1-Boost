-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scores table (only for official exam modes)
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    exam_mode TEXT NOT NULL CHECK(exam_mode IN ('organisationnelle', 'tresorerie')),
    score INTEGER NOT NULL CHECK(score >= 0 AND score <= 100),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_spent INTEGER NOT NULL,  -- in seconds
    category_scores TEXT,          -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_mode ON scores(exam_mode);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created ON scores(created_at DESC);
