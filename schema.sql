-- =====================================================================
-- PrepPilot AI – Smart Exam Preparation & Scheduler
-- Complete Normalized Relational Database Schema (MySQL / MariaDB / XAMPP)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS preppilot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE preppilot_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    target_score INT DEFAULT 85,
    daily_available_hours DECIMAL(4,2) DEFAULT 3.5,
    preferred_language VARCHAR(32) DEFAULT 'English',
    preferred_study_days JSON,
    study_start_time VARCHAR(10) DEFAULT '18:00',
    study_end_time VARCHAR(10) DEFAULT '21:30',
    theme ENUM('light', 'dark') DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Exams
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(191) NOT NULL,
    category ENUM('Competitive', 'College Semester', 'Entrance', 'Government', 'Certification') NOT NULL,
    exam_date DATE NOT NULL,
    daily_available_hours DECIMAL(4,2) DEFAULT 3.0,
    preferred_study_days JSON,
    target_score INT DEFAULT 85,
    difficulty_preference ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    preferred_language VARCHAR(32) DEFAULT 'English',
    notes TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_exam_user (user_id),
    INDEX idx_exam_date (exam_date)
) ENGINE=InnoDB;

-- 4. Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL,
    name VARCHAR(150) NOT NULL,
    color VARCHAR(20) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_subject_exam (exam_id)
) ENGINE=InnoDB;

-- 5. Topics
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL,
    name VARCHAR(191) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    estimated_hours DECIMAL(4,1) DEFAULT 5.0,
    is_completed BOOLEAN DEFAULT FALSE,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_topic_subject (subject_id)
) ENGINE=InnoDB;

-- 6. Study Materials
CREATE TABLE IF NOT EXISTS study_materials (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    exam_id VARCHAR(64) NOT NULL,
    subject_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type ENUM('pdf', 'docx', 'txt', 'text') NOT NULL,
    file_size BIGINT DEFAULT 0,
    extracted_text LONGTEXT,
    is_ocr_applied BOOLEAN DEFAULT FALSE,
    page_count INT DEFAULT 1,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_material_exam (exam_id)
) ENGINE=InnoDB;

-- 7. Document Analyses
CREATE TABLE IF NOT EXISTS document_analyses (
    id VARCHAR(64) PRIMARY KEY,
    material_id VARCHAR(64) NOT NULL UNIQUE,
    analysis_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Question Papers
CREATE TABLE IF NOT EXISTS question_papers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    exam_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    topic VARCHAR(191) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    total_questions INT NOT NULL,
    total_marks DECIMAL(6,2) NOT NULL,
    duration_minutes INT DEFAULT 30,
    negative_marking_per_question DECIMAL(4,2) DEFAULT 0.5,
    language VARCHAR(32) DEFAULT 'English',
    include_explanations_in_key BOOLEAN DEFAULT TRUE,
    use_only_uploaded_material BOOLEAN DEFAULT FALSE,
    instructions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_paper_exam (exam_id),
    INDEX idx_paper_user (user_id)
) ENGINE=InnoDB;

-- 9. Questions
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(64) PRIMARY KEY,
    paper_id VARCHAR(64) NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
    explanation TEXT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    subject VARCHAR(150),
    topic VARCHAR(191),
    marks DECIMAL(4,2) DEFAULT 2.0,
    negative_marks DECIMAL(4,2) DEFAULT 0.5,
    source_reference VARCHAR(255),
    FOREIGN KEY (paper_id) REFERENCES question_papers(id) ON DELETE CASCADE,
    INDEX idx_question_paper (paper_id)
) ENGINE=InnoDB;

-- 10. Test Attempts
CREATE TABLE IF NOT EXISTS test_attempts (
    id VARCHAR(64) PRIMARY KEY,
    paper_id VARCHAR(64) NOT NULL,
    exam_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    paper_title VARCHAR(255) NOT NULL,
    mode ENUM('online', 'manual-entry') NOT NULL DEFAULT 'online',
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds INT DEFAULT 0,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL DEFAULT 0,
    incorrect_answers INT NOT NULL DEFAULT 0,
    unattempted INT NOT NULL DEFAULT 0,
    total_marks_obtained DECIMAL(6,2) NOT NULL DEFAULT 0.0,
    max_possible_marks DECIMAL(6,2) NOT NULL DEFAULT 0.0,
    score_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    accuracy_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    topic_wise_performance JSON,
    difficulty_wise_performance JSON,
    FOREIGN KEY (paper_id) REFERENCES question_papers(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_attempt_paper (paper_id),
    INDEX idx_attempt_user (user_id),
    INDEX idx_attempt_exam (exam_id)
) ENGINE=InnoDB;

-- 11. Attempt Answers
CREATE TABLE IF NOT EXISTS attempt_answers (
    id VARCHAR(64) PRIMARY KEY,
    attempt_id VARCHAR(64) NOT NULL,
    question_id VARCHAR(64) NOT NULL,
    user_selected_option ENUM('A', 'B', 'C', 'D'),
    is_correct BOOLEAN DEFAULT FALSE,
    marks_awarded DECIMAL(4,2) DEFAULT 0.0,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
    INDEX idx_attempt_answers (attempt_id)
) ENGINE=InnoDB;

-- 12. Schedule Tasks
CREATE TABLE IF NOT EXISTS schedule_tasks (
    id VARCHAR(64) PRIMARY KEY,
    schedule_id VARCHAR(64) NOT NULL,
    exam_id VARCHAR(64) NOT NULL,
    task_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    duration_minutes INT NOT NULL,
    subject VARCHAR(150) NOT NULL,
    topic VARCHAR(191) NOT NULL,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    task_type ENUM('Learning', 'Practice', 'Revision', 'Mock Test', 'Break') NOT NULL,
    status ENUM('Pending', 'Completed', 'Partially Completed', 'Skipped') DEFAULT 'Pending',
    actual_minutes_spent INT DEFAULT 0,
    notes TEXT,
    skip_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_task_exam (exam_id),
    INDEX idx_task_date (task_date),
    INDEX idx_task_status (status)
) ENGINE=InnoDB;

-- 13. Study Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    exam_id VARCHAR(64),
    subject VARCHAR(150),
    topic VARCHAR(191),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    mode ENUM('manual', 'timer') DEFAULT 'timer',
    is_idle_excluded BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_user (user_id),
    INDEX idx_session_start (start_time)
) ENGINE=InnoDB;

-- 14. AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    exam_id VARCHAR(64) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    topic VARCHAR(191) NOT NULL,
    category ENUM('Weak Topic', 'Accuracy Improvement', 'Revision Alert', 'Time Management') NOT NULL,
    severity ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    actionable_prescription TEXT NOT NULL,
    suggested_action JSON,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_rec_user (user_id),
    INDEX idx_rec_exam (exam_id)
) ENGINE=InnoDB;

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
