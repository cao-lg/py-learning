-- Exam questions table - stores all exam question data including answers
CREATE TABLE IF NOT EXISTS exam_questions (
    id TEXT PRIMARY KEY,                    -- Format: examId_questionId (e.g., "ch01_basics_q1")
    exam_id TEXT NOT NULL,                  -- Exam identifier (e.g., "ch01_basics")
    question_id TEXT NOT NULL,              -- Question identifier (e.g., "q1")
    version TEXT,                            -- For multi-version exams (A, B, C)
    type TEXT NOT NULL,                     -- Question type: output, function, interactive, unittest, constraint, debug
    title TEXT NOT NULL,                    -- Question title
    instruction TEXT NOT NULL,              -- Question description
    initial_code TEXT NOT NULL,             -- Initial code template
    expected TEXT,                           -- Expected answer for scoring
    mock_inputs TEXT,                        -- JSON array of test inputs for interactive questions
    hidden_cases TEXT,                      -- JSON array of hidden test cases
    hints TEXT,                              -- JSON array of hints
    test_config TEXT NOT NULL,               -- JSON object with test configuration
    score INTEGER DEFAULT 10,               -- Question score
    created_at INTEGER NOT NULL,
    updated_at INTEGER
);

-- Indexes for optimized queries
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_version ON exam_questions(exam_id, version);
CREATE INDEX IF NOT EXISTS idx_exam_questions_id_version ON exam_questions(exam_id, question_id, version);
