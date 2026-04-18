-- Exam schedule management table
CREATE TABLE IF NOT EXISTS exam_schedule (
    exam_id TEXT PRIMARY KEY,
    start_time TEXT,
    end_time TEXT,
    updated_at INTEGER NOT NULL
);
