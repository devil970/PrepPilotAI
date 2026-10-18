import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, Exam, QuestionPaper, TestAttempt, ScheduleTask, StudySession, StudyMaterial, User, AiRecommendation } from './server/db.js';
import { generateAiQuestions, analyzeDocumentWithAi, generateCoachAdviceWithAi } from './server/aiService.js';
import { generateSmartSchedule } from './server/schedulerService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper to get active user (mock session / token bearer fallback for demonstration)
function getActiveUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token) {
      const user = db.getUserById(token);
      if (user) return user.id;
    }
  }
  const allUsers = db.getData().users;
  if (allUsers && allUsers.length > 0) {
    return allUsers[0].id;
  }
  return '';
}

// ----------------------------------------------------
// 1. AUTH & USER PROFILE ROUTES
// ----------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  let user = db.getUserByEmail(email);
  if (!user) {
    // For convenience of user testing, auto-create student account if email not found
    const isFirstAdmin = email.toLowerCase().includes('admin');
    user = db.createUser({
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim().toLowerCase(),
      passwordHash: 'hashed_' + (password || 'default'),
      role: isFirstAdmin ? 'admin' : 'student',
      createdAt: new Date().toISOString(),
      preferences: {
        targetScore: 85,
        dailyAvailableHours: 3.5,
        preferredLanguage: 'English',
        preferredStudyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        studyStartTime: '18:00',
        studyEndTime: '21:30',
        theme: 'light'
      }
    });
  }

  res.json({
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences
    }
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role = 'student', preferences } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email: email.trim().toLowerCase(),
    passwordHash: 'hashed_' + (password || 'secret'),
    role: role === 'admin' ? 'admin' : 'student',
    createdAt: new Date().toISOString(),
    preferences: {
      targetScore: preferences?.targetScore || 85,
      dailyAvailableHours: preferences?.dailyAvailableHours || 3,
      preferredLanguage: preferences?.preferredLanguage || 'English',
      preferredStudyDays: preferences?.preferredStudyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      studyStartTime: preferences?.studyStartTime || '18:00',
      studyEndTime: preferences?.studyEndTime || '21:00',
      theme: preferences?.theme || 'light'
    }
  };

  db.createUser(newUser);
  res.status(201).json({
    token: newUser.id,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      preferences: newUser.preferences
    }
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  if (!userId) {
    return res.json({ authenticated: false, user: null });
  }
  const user = db.getUserById(userId);
  if (!user) {
    return res.json({ authenticated: false, user: null });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: user.preferences,
    authenticated: true
  });
});

app.post('/api/database/clear-all', (req: Request, res: Response) => {
  db.clearAllData();
  res.json({ success: true, message: 'All database data successfully wiped clean.' });
});

app.put('/api/auth/preferences', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updatedPrefs = { ...user.preferences, ...req.body };
  db.updateUser(userId, { preferences: updatedPrefs });
  res.json({ preferences: updatedPrefs });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const caller = db.getUserById(userId);
  if (caller?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  const allUsers = db.getData().users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    preferences: u.preferences
  }));
  res.json(allUsers);
});

// ----------------------------------------------------
// 2. EXAM & SYLLABUS MANAGEMENT
// ----------------------------------------------------
app.get('/api/exams', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const exams = db.getExamsByUser(userId);
  res.json(exams);
});

app.get('/api/exams/:id', (req: Request, res: Response) => {
  const exam = db.getExamById(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json(exam);
});

app.post('/api/exams', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const {
    name,
    category,
    examDate,
    dailyAvailableHours = 3,
    preferredStudyDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    targetScore = 85,
    difficultyPreference = 'Medium',
    preferredLanguage = 'English',
    notes = '',
    subjects = []
  } = req.body;

  if (!name || !examDate) {
    return res.status(400).json({ error: 'Exam name and exam date are required' });
  }

  const examId = `exam_${Date.now()}`;
  const formattedSubjects = subjects.map((s: any, sIdx: number) => {
    const sId = `sub_${examId}_${sIdx + 1}`;
    return {
      id: sId,
      examId,
      name: s.name || `Subject ${sIdx + 1}`,
      color: s.color || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'][sIdx % 6],
      topics: (s.topics || []).map((t: any, tIdx: number) => ({
        id: `top_${sId}_${tIdx + 1}`,
        subjectId: sId,
        name: typeof t === 'string' ? t : t.name,
        difficulty: t.difficulty || 'Medium',
        estimatedHours: t.estimatedHours || 5,
        isCompleted: false
      }))
    };
  });

  const newExam: Exam = {
    id: examId,
    userId,
    name,
    category: category || 'Competitive',
    examDate,
    dailyAvailableHours,
    preferredStudyDays,
    targetScore,
    difficultyPreference,
    preferredLanguage,
    notes,
    isArchived: false,
    createdAt: new Date().toISOString(),
    subjects: formattedSubjects
  };

  db.createExam(newExam);

  // Automatically generate initial study schedule for the new exam
  const initialTasks = generateSmartSchedule({ exam: newExam, dailyHours: dailyAvailableHours, availableDays: preferredStudyDays });
  for (const t of initialTasks) {
    db.createTask(t);
  }

  res.status(201).json(newExam);
});

app.put('/api/exams/:id', (req: Request, res: Response) => {
  const examId = req.params.id;
  const existing = db.getExamById(examId);
  if (!existing) return res.status(404).json({ error: 'Exam not found' });

  const oldDate = existing.examDate;
  const updated = db.updateExam(examId, req.body);

  // If exam date was changed, auto-recalculate future schedule without wiping completed history
  if (req.body.examDate && req.body.examDate !== oldDate && updated) {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTasks = generateSmartSchedule({
      exam: updated,
      startDate: todayStr,
      dailyHours: updated.dailyAvailableHours,
      availableDays: updated.preferredStudyDays
    });
    db.replaceFutureTasks(examId, todayStr, newTasks);
  }

  res.json(updated);
});

app.delete('/api/exams/:id', (req: Request, res: Response) => {
  const success = db.deleteExam(req.params.id);
  if (!success) return res.status(404).json({ error: 'Exam not found' });
  res.json({ success: true, message: 'Exam and all associated records deleted successfully' });
});

// ----------------------------------------------------
// 3. STUDY MATERIALS & DOCUMENT ANALYSIS
// ----------------------------------------------------
app.get('/api/materials', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const examId = req.query.examId as string;
  if (examId) {
    res.json(db.getMaterialsByExam(examId));
  } else {
    res.json(db.getMaterialsByUser(userId));
  }
});

app.post('/api/materials/upload-text', async (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { title, text, fileName = 'Document.txt', examId, subjectId, isOcrApplied = false } = req.body;

  if (!title || !text || !examId) {
    return res.status(400).json({ error: 'Title, extracted text, and examId are required' });
  }

  const analysis = await analyzeDocumentWithAi(fileName, text);

  const words = text.split(/\s+/).length;
  const pageCount = Math.max(1, Math.ceil(words / 350));

  const material: StudyMaterial = {
    id: `mat_${Date.now()}`,
    userId,
    examId,
    subjectId,
    title,
    fileName,
    fileType: fileName.endsWith('.pdf') ? 'pdf' : fileName.endsWith('.docx') ? 'docx' : 'text',
    fileSize: text.length * 2,
    extractedText: text,
    isOcrApplied: Boolean(isOcrApplied),
    pageCount,
    uploadedAt: new Date().toISOString(),
    analysis
  };

  db.createMaterial(material);
  res.status(201).json(material);
});

app.delete('/api/materials/:id', (req: Request, res: Response) => {
  const success = db.deleteMaterial(req.params.id);
  if (!success) return res.status(404).json({ error: 'Material not found' });
  res.json({ success: true });
});

// ----------------------------------------------------
// 4. AI QUESTION PAPER GENERATOR & REPOSITORY
// ----------------------------------------------------
app.post('/api/questions/generate', async (req: Request, res: Response) => {
  const {
    subject,
    topic,
    difficulty = 'Medium',
    questionCount = 5,
    language = 'English',
    marksPerQuestion = 2,
    negativeMarksPerQuestion = 0.5,
    studyMaterialId,
    rawText,
    useOnlyUploadedMaterial = false
  } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ error: 'Subject and topic are required' });
  }

  let textSource = rawText || '';
  if (studyMaterialId) {
    const mat = db.getMaterialById(studyMaterialId);
    if (mat) {
      textSource = mat.extractedText;
    }
  }

  try {
    const questions = await generateAiQuestions({
      subject,
      topic,
      difficulty,
      questionCount: Math.min(100, Math.max(1, questionCount)),
      language,
      marksPerQuestion,
      negativeMarksPerQuestion,
      studyMaterialText: textSource,
      useOnlyUploadedMaterial
    });

    res.json({
      success: true,
      questions,
      metadata: {
        totalQuestions: questions.length,
        totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
        subject,
        topic,
        difficulty,
        language
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Question generation failed' });
  }
});

app.get('/api/papers', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const examId = req.query.examId as string;
  if (examId) {
    res.json(db.getPapersByExam(examId));
  } else {
    res.json(db.getPapersByUser(userId));
  }
});

app.get('/api/papers/:id', (req: Request, res: Response) => {
  const paper = db.getPaperById(req.params.id);
  if (!paper) return res.status(404).json({ error: 'Question paper not found' });
  res.json(paper);
});

app.post('/api/papers', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const {
    examId,
    title,
    subject,
    topic,
    difficulty,
    durationMinutes = 30,
    negativeMarkingPerQuestion = 0.5,
    language = 'English',
    includeExplanationsInKey = true,
    useOnlyUploadedMaterial = false,
    instructions,
    questions = []
  } = req.body;

  if (!examId || !title || !questions.length) {
    return res.status(400).json({ error: 'Exam ID, paper title, and valid questions are required' });
  }

  const totalMarks = questions.reduce((acc: number, q: any) => acc + (q.marks || 1), 0);

  const paper: QuestionPaper = {
    id: `paper_${Date.now()}`,
    userId,
    examId,
    title,
    subject: subject || 'General',
    topic: topic || 'All Topics',
    difficulty: difficulty || 'Medium',
    totalQuestions: questions.length,
    totalMarks,
    durationMinutes,
    negativeMarkingPerQuestion,
    language,
    includeExplanationsInKey,
    useOnlyUploadedMaterial,
    instructions: instructions || [
      `This paper contains ${questions.length} questions carrying a maximum of ${totalMarks} marks.`,
      `Each correct answer awards the designated marks.`,
      negativeMarkingPerQuestion > 0
        ? `Negative marking of ${negativeMarkingPerQuestion} marks applies for incorrect answers.`
        : 'There is no negative marking.',
      'Select only one response per question. Calculators/smartphones are strictly prohibited.'
    ],
    createdAt: new Date().toISOString(),
    questions
  };

  db.createPaper(paper);
  res.status(201).json(paper);
});

app.post('/api/papers/:id/duplicate', (req: Request, res: Response) => {
  const existing = db.getPaperById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Original paper not found' });

  const duplicated: QuestionPaper = {
    ...existing,
    id: `paper_${Date.now()}`,
    title: `${existing.title} (Copy)`,
    createdAt: new Date().toISOString(),
    questions: existing.questions.map((q, idx) => ({
      ...q,
      id: `q_dup_${Date.now()}_${idx + 1}`
    }))
  };

  db.createPaper(duplicated);
  res.status(201).json(duplicated);
});

app.delete('/api/papers/:id', (req: Request, res: Response) => {
  const success = db.deletePaper(req.params.id);
  if (!success) return res.status(404).json({ error: 'Question paper not found' });
  res.json({ success: true });
});

// ----------------------------------------------------
// 5. TEST EXECUTION, SCORING & ANSWER VERIFICATION
// ----------------------------------------------------
app.post('/api/tests/submit', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const {
    paperId,
    examId,
    mode = 'online', // 'online' | 'manual-entry'
    userAnswers, // Record<questionId, 'A'|'B'|'C'|'D' | null>
    startedAt = new Date(Date.now() - 600000).toISOString(),
    timeTakenSeconds = 600
  } = req.body;

  const paper = db.getPaperById(paperId);
  if (!paper) return res.status(404).json({ error: 'Question paper not found' });

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let totalMarksAwarded = 0;

  const evaluatedAnswers: TestAttempt['answers'] = [];
  const topicStats: Record<string, { total: number; correct: number }> = {};
  const diffStats: Record<string, { total: number; correct: number }> = {};

  for (const q of paper.questions) {
    const selected = userAnswers?.[q.id] || null;

    if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
    if (!diffStats[q.difficulty]) diffStats[q.difficulty] = { total: 0, correct: 0 };

    topicStats[q.topic].total++;
    diffStats[q.difficulty].total++;

    if (!selected) {
      unattemptedCount++;
      evaluatedAnswers.push({
        questionId: q.id,
        userSelectedOption: null,
        isCorrect: false,
        marksAwarded: 0
      });
    } else if (selected.toUpperCase() === q.correctOption.toUpperCase()) {
      correctCount++;
      totalMarksAwarded += q.marks;
      topicStats[q.topic].correct++;
      diffStats[q.difficulty].correct++;
      evaluatedAnswers.push({
        questionId: q.id,
        userSelectedOption: selected,
        isCorrect: true,
        marksAwarded: q.marks
      });
    } else {
      incorrectCount++;
      const penalty = q.negativeMarks || paper.negativeMarkingPerQuestion || 0;
      totalMarksAwarded -= penalty;
      evaluatedAnswers.push({
        questionId: q.id,
        userSelectedOption: selected,
        isCorrect: false,
        marksAwarded: -penalty
      });
    }
  }

  const attemptedCount = correctCount + incorrectCount;
  const accuracyPercentage = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const scorePercentage = paper.totalMarks > 0 ? Math.max(0, Math.round((totalMarksAwarded / paper.totalMarks) * 100)) : 0;

  const attempt: TestAttempt = {
    id: `att_${Date.now()}`,
    paperId,
    examId: examId || paper.examId,
    userId,
    paperTitle: paper.title,
    mode,
    startedAt,
    completedAt: new Date().toISOString(),
    timeTakenSeconds,
    totalQuestions: paper.questions.length,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unattempted: unattemptedCount,
    totalMarksObtained: Math.round(totalMarksAwarded * 100) / 100,
    maxPossibleMarks: paper.totalMarks,
    scorePercentage,
    accuracyPercentage,
    answers: evaluatedAnswers,
    topicWisePerformance: topicStats,
    difficultyWisePerformance: diffStats
  };

  db.createAttempt(attempt);

  // If there are weak topics (<60% accuracy), trigger AI coach check
  const weakTopicsList = Object.entries(topicStats)
    .filter(([_, stats]) => (stats.correct / stats.total) < 0.6)
    .map(([top]) => top);

  if (weakTopicsList.length > 0) {
    const primaryWeak = weakTopicsList[0];
    const recId = `rec_${Date.now()}`;
    const newRec: AiRecommendation = {
      id: recId,
      userId,
      examId: paper.examId,
      subject: paper.subject,
      topic: primaryWeak,
      category: 'Weak Topic',
      severity: 'high',
      title: `Improvement Priority: ${primaryWeak}`,
      actionablePrescription: `In test "${paper.title}", you scored under 60% on ${primaryWeak}. Revise key concepts for 25 minutes, solve 10 Easy questions, and attempt a follow-up test.`,
      suggestedAction: {
        type: 'solve_mcq',
        difficulty: 'Easy',
        questionCount: 10,
        recommendedMinutes: 25
      },
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    db.createRecommendation(newRec);
  }

  res.status(201).json(attempt);
});

app.get('/api/tests/attempts', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const examId = req.query.examId as string;
  const paperId = req.query.paperId as string;

  if (paperId) {
    res.json(db.getAttemptsByPaper(paperId));
  } else if (examId) {
    res.json(db.getAttemptsByExam(examId));
  } else {
    res.json(db.getAttemptsByUser(userId));
  }
});

app.get('/api/tests/attempts/:id', (req: Request, res: Response) => {
  const attempt = db.getAttemptById(req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  const paper = db.getPaperById(attempt.paperId);
  res.json({ attempt, paper });
});

// ----------------------------------------------------
// 6. SMART SCHEDULER & DAY-BY-DAY PLAN
// ----------------------------------------------------
app.get('/api/schedules/tasks', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const examId = req.query.examId as string;
  if (examId) {
    res.json(db.getTasksByExam(examId));
  } else {
    res.json(db.getAllTasksByUser(userId));
  }
});

app.post('/api/schedules/generate', (req: Request, res: Response) => {
  const { examId, startDate, dailyHours, availableDays, startTime } = req.body;
  const exam = db.getExamById(examId);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });

  // Get weak topics from recent test attempts
  const attempts = db.getAttemptsByExam(examId);
  const weakTopics: string[] = [];
  attempts.forEach(att => {
    Object.entries(att.topicWisePerformance).forEach(([top, stats]) => {
      if (stats.total >= 1 && (stats.correct / stats.total) < 0.6) {
        if (!weakTopics.includes(top)) weakTopics.push(top);
      }
    });
  });

  const generated = generateSmartSchedule({
    exam,
    startDate: startDate || new Date().toISOString().split('T')[0],
    dailyHours: dailyHours || exam.dailyAvailableHours,
    startTime: startTime || '18:00',
    availableDays: availableDays || exam.preferredStudyDays,
    weakTopics
  });

  const todayStr = new Date().toISOString().split('T')[0];
  db.replaceFutureTasks(examId, todayStr, generated);

  res.json({
    success: true,
    taskCount: generated.length,
    tasks: db.getTasksByExam(examId)
  });
});

app.put('/api/schedules/tasks/:id', (req: Request, res: Response) => {
  const taskId = req.params.id;
  const existing = db.getTaskById(taskId);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const updated = db.updateTask(taskId, req.body);

  // If marked completed, auto-log study session
  if (req.body.status === 'Completed' && existing.status !== 'Completed' && updated) {
    db.createSession({
      id: `sess_auto_${Date.now()}`,
      userId: getActiveUserId(req),
      examId: updated.examId,
      subject: updated.subject,
      topic: updated.topic,
      startTime: new Date(Date.now() - (updated.durationMinutes * 60000)).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: updated.durationMinutes,
      mode: 'manual',
      isIdleExcluded: true,
      notes: `Task completed: ${updated.topic}`
    });
  }

  res.json(updated);
});

app.post('/api/schedules/tasks', (req: Request, res: Response) => {
  const {
    examId,
    date,
    startTime = '18:00',
    endTime = '19:30',
    durationMinutes = 90,
    subject,
    topic,
    priority = 'Medium',
    difficulty = 'Medium',
    taskType = 'Learning',
    notes
  } = req.body;

  if (!examId || !date || !subject || !topic) {
    return res.status(400).json({ error: 'examId, date, subject, and topic are required' });
  }

  const newTask: ScheduleTask = {
    id: `tsk_manual_${Date.now()}`,
    scheduleId: `sch_${examId}`,
    examId,
    date,
    startTime,
    endTime,
    durationMinutes,
    subject,
    topic,
    priority,
    difficulty,
    taskType,
    status: 'Pending',
    actualMinutesSpent: 0,
    notes
  };

  db.createTask(newTask);
  res.status(201).json(newTask);
});

app.delete('/api/schedules/tasks/:id', (req: Request, res: Response) => {
  const success = db.deleteTask(req.params.id);
  if (!success) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
});

// ----------------------------------------------------
// 7. STUDY SESSIONS & TIME TRACKING
// ----------------------------------------------------
app.get('/api/study-sessions', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  res.json(db.getSessionsByUser(userId));
});

app.post('/api/study-sessions', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { examId, subject, topic, startTime, endTime, durationMinutes, mode = 'timer', notes } = req.body;

  const session: StudySession = {
    id: `sess_${Date.now()}`,
    userId,
    examId,
    subject: subject || 'General Study',
    topic: topic || 'Core Revision',
    startTime: startTime || new Date(Date.now() - (durationMinutes * 60000)).toISOString(),
    endTime: endTime || new Date().toISOString(),
    durationMinutes: durationMinutes || 30,
    mode,
    isIdleExcluded: true,
    notes
  };

  db.createSession(session);
  res.status(201).json(session);
});

// ----------------------------------------------------
// 8. AI PERFORMANCE COACH & RECOMMENDATIONS
// ----------------------------------------------------
app.get('/api/coach/recommendations', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const examId = req.query.examId as string;
  if (examId) {
    res.json(db.getRecommendationsByExam(examId));
  } else {
    res.json(db.getRecommendationsByUser(userId));
  }
});

app.put('/api/coach/recommendations/:id', (req: Request, res: Response) => {
  const rec = db.updateRecommendation(req.params.id, req.body);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
  res.json(rec);
});

app.post('/api/coach/refresh', async (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const examId = req.body.examId as string;
  const attempts = examId ? db.getAttemptsByExam(examId) : db.getAttemptsByUser(userId);

  const topicAccuracy: Record<string, { total: number; correct: number; subject: string }> = {};

  attempts.forEach(att => {
    Object.entries(att.topicWisePerformance).forEach(([top, stats]) => {
      if (!topicAccuracy[top]) {
        topicAccuracy[top] = { total: 0, correct: 0, subject: att.paperTitle.split('-')[0]?.trim() || 'General' };
      }
      topicAccuracy[top].total += stats.total;
      topicAccuracy[top].correct += stats.correct;
    });
  });

  const weakList = Object.entries(topicAccuracy)
    .filter(([_, stats]) => stats.total >= 1 && (stats.correct / stats.total) < 0.65)
    .map(([topic, stats]) => ({
      topic,
      subject: stats.subject,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      totalAttempts: stats.total
    }));

  const generatedAdvice = await generateCoachAdviceWithAi(weakList, ['Confusion between timer expiration and fast retransmit', 'Incomplete formula recall']);

  for (const item of generatedAdvice) {
    db.createRecommendation({
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      examId: examId || db.getExamsByUser(userId)[0]?.id || 'general',
      subject: item.subject,
      topic: item.topic,
      category: (item.category as any) || 'Weak Topic',
      severity: item.severity as any,
      title: item.title,
      actionablePrescription: item.actionablePrescription,
      suggestedAction: {
        type: item.actionType as any || 'solve_mcq',
        difficulty: item.difficulty as any || 'Easy',
        questionCount: 10,
        recommendedMinutes: item.recommendedMinutes || 30
      },
      isCompleted: false,
      createdAt: new Date().toISOString()
    });
  }

  const updatedRecs = examId ? db.getRecommendationsByExam(examId) : db.getRecommendationsByUser(userId);
  res.json(updatedRecs);
});

// ----------------------------------------------------
// 9. DASHBOARD SUMMARY & ANALYTICS OVERVIEW
// ----------------------------------------------------
app.get('/api/analytics/overview', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const examId = req.query.examId as string;

  const exams = examId ? [db.getExamById(examId)].filter(Boolean) as Exam[] : db.getExamsByUser(userId);
  const attempts = examId ? db.getAttemptsByExam(examId) : db.getAttemptsByUser(userId);
  const tasks = examId ? db.getTasksByExam(examId) : db.getAllTasksByUser(userId);
  const papers = examId ? db.getPapersByExam(examId) : db.getPapersByUser(userId);
  const sessions = db.getSessionsByUser(userId);

  // Countdown for active exams
  const now = new Date();
  const examCountdowns = exams.map(e => {
    const examDate = new Date(e.examDate);
    const diffMs = examDate.getTime() - now.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
    return {
      examId: e.id,
      name: e.name,
      category: e.category,
      examDate: e.examDate,
      days,
      hours,
      minutes,
      isPassed: diffMs < 0
    };
  });

  // Today study target & completed study time
  const todayStr = now.toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const todayTargetMinutes = todayTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const todayCompletedMinutes = sessions
    .filter(s => s.startTime.startsWith(todayStr))
    .reduce((sum, s) => sum + s.durationMinutes, 0) +
    todayTasks.filter(t => t.status === 'Completed').reduce((sum, t) => sum + (t.actualMinutesSpent || t.durationMinutes), 0);

  // Overall syllabus completion %
  let totalTopicsCount = 0;
  let completedTopicsCount = 0;
  exams.forEach(e => {
    e.subjects.forEach(s => {
      s.topics.forEach(t => {
        totalTopicsCount++;
        if (t.isCompleted) completedTopicsCount++;
      });
    });
  });
  const syllabusCompletionPercentage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // Test Performance statistics
  const totalTestsAttempted = attempts.length;
  const averageTestScore = totalTestsAttempted > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.scorePercentage, 0) / totalTestsAttempted)
    : 0;

  // Difficulty performance
  const difficultySummary = {
    Easy: { total: 0, correct: 0, accuracy: 0 },
    Medium: { total: 0, correct: 0, accuracy: 0 },
    Hard: { total: 0, correct: 0, accuracy: 0 }
  };

  attempts.forEach(a => {
    Object.entries(a.difficultyWisePerformance).forEach(([diff, stats]) => {
      if (difficultySummary[diff as keyof typeof difficultySummary]) {
        difficultySummary[diff as keyof typeof difficultySummary].total += stats.total;
        difficultySummary[diff as keyof typeof difficultySummary].correct += stats.correct;
      }
    });
  });

  Object.keys(difficultySummary).forEach(k => {
    const d = difficultySummary[k as keyof typeof difficultySummary];
    d.accuracy = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
  });

  // Weak topics calculation
  const topicBreakdown: Record<string, { total: number; correct: number }> = {};
  attempts.forEach(a => {
    Object.entries(a.topicWisePerformance).forEach(([top, stats]) => {
      if (!topicBreakdown[top]) topicBreakdown[top] = { total: 0, correct: 0 };
      topicBreakdown[top].total += stats.total;
      topicBreakdown[top].correct += stats.correct;
    });
  });

  const weakTopics = Object.entries(topicBreakdown)
    .map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }))
    .filter(t => t.total >= 1 && t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  // Overdue tasks
  const overdueTasks = tasks.filter(t => t.date < todayStr && t.status === 'Pending');

  // Study streak calculation
  const uniqueStudyDates = new Set(sessions.map(s => s.startTime.split('T')[0]));
  tasks.filter(t => t.status === 'Completed').forEach(t => uniqueStudyDates.add(t.date));

  let streak = 0;
  let checkDay = new Date();
  while (true) {
    const ds = checkDay.toISOString().split('T')[0];
    if (uniqueStudyDates.has(ds)) {
      streak++;
      checkDay = new Date(checkDay.getTime() - 86400000);
    } else if (streak === 0) {
      // Allow yesterday if user hasn't studied yet today
      checkDay = new Date(checkDay.getTime() - 86400000);
      const yestDs = checkDay.toISOString().split('T')[0];
      if (uniqueStudyDates.has(yestDs)) {
        streak++;
        checkDay = new Date(checkDay.getTime() - 86400000);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  res.json({
    activeExamsCount: exams.length,
    examCountdowns,
    todayTargetMinutes,
    todayCompletedMinutes,
    syllabusCompletionPercentage,
    totalGeneratedPapers: papers.length,
    totalTestsAttempted,
    averageTestScore,
    difficultyPerformance: difficultySummary,
    currentStudyStreakDays: streak,
    weakTopics,
    overdueTasksCount: overdueTasks.length,
    overdueTasks: overdueTasks.slice(0, 5),
    todayTasks,
    recentAttempts: attempts.slice(0, 5),
    aiRecommendations: examId ? db.getRecommendationsByExam(examId) : db.getRecommendationsByUser(userId)
  });
});

// ----------------------------------------------------
// 10. SYSTEM STATS & RESET
// ----------------------------------------------------
app.get('/api/system/stats', (req: Request, res: Response) => {
  const d = db.getData();
  res.json({
    status: 'online',
    platform: 'PrepPilot AI Enterprise Suite',
    counts: {
      users: d.users.length,
      exams: d.exams.length,
      papers: d.questionPapers.length,
      materials: d.studyMaterials.length,
      attempts: d.testAttempts.length,
      tasks: d.scheduleTasks.length,
      sessions: d.studySessions.length
    },
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// ----------------------------------------------------
// VITE DEV SERVER INTEGRATION
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrepPilot AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
