-- =====================================================================
-- PrepPilot AI – Demonstration Seed Data
-- =====================================================================

USE preppilot_db;

-- 1. Users
INSERT INTO users (id, name, email, password_hash, role) VALUES
('usr_default_01', 'Atharva Dhawane', 'atharvadhawane789@gmail.com', 'pbkdf2:sha256:600000$demo$hash', 'student'),
('usr_admin_01', 'PrepPilot Admin', 'admin@preppilot.ai', 'pbkdf2:sha256:600000$admin$hash', 'admin')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. User Preferences
INSERT INTO user_preferences (id, user_id, target_score, daily_available_hours, preferred_language, preferred_study_days, study_start_time, study_end_time, theme) VALUES
('pref_01', 'usr_default_01', 85, 3.5, 'English', '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]', '18:00', '21:30', 'light')
ON DUPLICATE KEY UPDATE target_score=VALUES(target_score);

-- 3. Exams
INSERT INTO exams (id, user_id, name, category, exam_date, daily_available_hours, preferred_study_days, target_score, difficulty_preference, preferred_language, notes) VALUES
('exam_ugc_net', 'usr_default_01', 'UGC NET Computer Science & Applications', 'Competitive', DATE_ADD(CURDATE(), INTERVAL 45 DAY), 3.5, '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]', 82, 'Medium', 'English', 'Aiming for JRF cut-off in Computer Networks, DBMS, and TOC.'),
('exam_college_sem', 'usr_default_01', 'B.Tech Semester VI Final Exams', 'College Semester', DATE_ADD(CURDATE(), INTERVAL 22 DAY), 2.5, '["Monday","Tuesday","Wednesday","Thursday","Friday"]', 88, 'Medium', 'English', 'Internal assessment scored 28/30. Need strong conceptual clarity.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Subjects
INSERT INTO subjects (id, exam_id, name, color) VALUES
('sub_cn', 'exam_ugc_net', 'Computer Networks', '#3B82F6'),
('sub_dbms', 'exam_ugc_net', 'Database Management Systems', '#10B981'),
('sub_toc', 'exam_ugc_net', 'Theory of Computation', '#8B5CF6')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Topics
INSERT INTO topics (id, subject_id, name, difficulty, estimated_hours, is_completed, accuracy_rate) VALUES
('top_osi', 'sub_cn', 'OSI Reference Model & TCP/IP', 'Easy', 4.0, TRUE, 85.0),
('top_routing', 'sub_cn', 'Routing Algorithms (Dijkstra, Bellman-Ford)', 'Medium', 6.0, TRUE, 72.0),
('top_crypto', 'sub_cn', 'Network Security & Public Key Cryptography', 'Hard', 8.0, FALSE, 45.0),
('top_congestion', 'sub_cn', 'TCP Congestion Control & Flow Control', 'Medium', 5.0, FALSE, 60.0),
('top_sql', 'sub_dbms', 'Relational Algebra & SQL Joins', 'Easy', 5.0, TRUE, 90.0),
('top_normal', 'sub_dbms', 'Normalization (1NF to BCNF, 4NF)', 'Medium', 7.0, TRUE, 78.0),
('top_dfa', 'sub_toc', 'DFA, NFA & Regular Expressions', 'Medium', 6.0, TRUE, 80.0)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. Question Paper
INSERT INTO question_papers (id, user_id, exam_id, title, subject, topic, difficulty, total_questions, total_marks, duration_minutes, negative_marking_per_question, language, include_explanations_in_key) VALUES
('paper_cn_mock1', 'usr_default_01', 'exam_ugc_net', 'Computer Networks - OSI & Congestion Diagnostic Test', 'Computer Networks', 'OSI Reference Model & TCP Congestion Control', 'Medium', 5, 10.0, 15, 0.5, 'English', TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. Questions
INSERT INTO questions (id, paper_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, subject, topic, marks, negative_marks) VALUES
('q1', 'paper_cn_mock1', 'Which layer of the OSI model is strictly responsible for end-to-end process-to-process communication and port addressing?', 'Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer', 'C', 'The Transport Layer provides process-to-process delivery using port numbers.', 'Easy', 'Computer Networks', 'OSI Reference Model', 2.0, 0.5),
('q2', 'paper_cn_mock1', 'In TCP congestion control, how does cwnd behave during Slow Start phase upon receiving each round of ACKs?', 'Increases linearly by 1 MSS', 'Doubles every RTT (exponential growth)', 'Remains constant until ssthresh', 'Decreases multiplicatively by half', 'B', 'During Slow Start, cwnd doubles every RTT until reaching ssthresh.', 'Medium', 'Computer Networks', 'TCP Congestion Control', 2.0, 0.5),
('q3', 'paper_cn_mock1', 'What triggers the Fast Retransmit mechanism in standard TCP implementations?', 'RTO timer expiration', 'Receipt of 3 duplicate ACKs', 'NIC failure alert', 'ECN router signal', 'B', 'Three duplicate ACKs trigger Fast Retransmit without waiting for timer expiration.', 'Medium', 'Computer Networks', 'TCP Congestion Control', 2.0, 0.5),
('q4', 'paper_cn_mock1', 'If propagation time is Tp and transmission time is Tt, what is the maximum channel efficiency of Stop-and-Wait protocol where a = Tp / Tt?', '1 / (1 + a)', '1 / (1 + 2a)', '2a / (1 + 2a)', '1 / (2 + a)', 'B', 'Efficiency = Tt / (Tt + 2*Tp) = 1 / (1 + 2a).', 'Hard', 'Computer Networks', 'Data Link Layer Flow Control', 2.0, 0.5),
('q5', 'paper_cn_mock1', 'Which cryptographic algorithm relies on the mathematical difficulty of factoring large composite prime products to provide public key encryption?', 'AES', 'DES', 'RSA Algorithm', 'Diffie-Hellman Key Exchange', 'C', 'RSA security is based on factoring the product of two large prime numbers.', 'Medium', 'Computer Networks', 'Network Security & Public Key Cryptography', 2.0, 0.5)
ON DUPLICATE KEY UPDATE question_text=VALUES(question_text);
