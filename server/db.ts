import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: string;
  preferences: {
    targetScore: number;
    dailyAvailableHours: number;
    preferredLanguage: 'English' | 'Hindi' | 'Marathi';
    preferredStudyDays: string[];
    studyStartTime: string;
    studyEndTime: string;
    theme: 'light' | 'dark';
  };
}

export interface Exam {
  id: string;
  userId: string;
  name: string;
  category: 'Competitive' | 'College Semester' | 'Entrance' | 'Government' | 'Certification';
  examDate: string; // ISO date YYYY-MM-DD
  dailyAvailableHours: number;
  preferredStudyDays: string[];
  targetScore: number;
  difficultyPreference: 'Easy' | 'Medium' | 'Hard';
  preferredLanguage: string;
  notes: string;
  isArchived: boolean;
  createdAt: string;
  subjects: ExamSubject[];
}

export interface ExamSubject {
  id: string;
  examId: string;
  name: string;
  color: string;
  topics: ExamTopic[];
}

export interface ExamTopic {
  id: string;
  subjectId: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  isCompleted: boolean;
  accuracyRate?: number;
}

export interface StudyMaterial {
  id: string;
  userId: string;
  examId: string;
  subjectId?: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'text';
  fileSize: number;
  extractedText: string;
  isOcrApplied: boolean;
  pageCount: number;
  uploadedAt: string;
  analysis?: {
    chapters: Array<{
      chapterNumber: number;
      title: string;
      pageStart: number;
      pageEnd: number;
      keyConcepts: string[];
      formulas: string[];
      summary: string;
    }>;
    importantDefinitions: string[];
    suggestedTopics: string[];
  };
}

export interface Question {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  topic: string;
  marks: number;
  negativeMarks: number;
  sourceReference?: string;
}

export interface QuestionPaper {
  id: string;
  userId: string;
  examId: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarkingPerQuestion: number;
  language: string;
  includeExplanationsInKey: boolean;
  useOnlyUploadedMaterial: boolean;
  instructions: string[];
  createdAt: string;
  questions: Question[];
}

export interface TestAttempt {
  id: string;
  paperId: string;
  examId: string;
  userId: string;
  paperTitle: string;
  mode: 'online' | 'manual-entry';
  startedAt: string;
  completedAt: string;
  timeTakenSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  totalMarksObtained: number;
  maxPossibleMarks: number;
  scorePercentage: number;
  accuracyPercentage: number;
  answers: Array<{
    questionId: string;
    userSelectedOption: 'A' | 'B' | 'C' | 'D' | null;
    isCorrect: boolean;
    marksAwarded: number;
  }>;
  topicWisePerformance: Record<string, { total: number; correct: number }>;
  difficultyWisePerformance: Record<string, { total: number; correct: number }>;
}

export interface ScheduleTask {
  id: string;
  scheduleId: string;
  examId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  subject: string;
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  taskType: 'Learning' | 'Practice' | 'Revision' | 'Mock Test' | 'Break';
  status: 'Pending' | 'Completed' | 'Partially Completed' | 'Skipped';
  actualMinutesSpent: number;
  notes?: string;
  skipReason?: string;
}

export interface StudySession {
  id: string;
  userId: string;
  examId?: string;
  subject?: string;
  topic?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  mode: 'manual' | 'timer';
  isIdleExcluded: boolean;
  notes?: string;
}

export interface AiRecommendation {
  id: string;
  userId: string;
  examId: string;
  subject: string;
  topic: string;
  category: 'Weak Topic' | 'Accuracy Improvement' | 'Revision Alert' | 'Time Management';
  severity: 'high' | 'medium' | 'low';
  title: string;
  actionablePrescription: string;
  suggestedAction: {
    type: 'solve_mcq' | 'revise_notes' | 'timed_mock';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    questionCount?: number;
    recommendedMinutes: number;
  };
  isCompleted: boolean;
  createdAt: string;
}

export interface DatabaseData {
  users: User[];
  exams: Exam[];
  studyMaterials: StudyMaterial[];
  questionPapers: QuestionPaper[];
  testAttempts: TestAttempt[];
  scheduleTasks: ScheduleTask[];
  studySessions: StudySession[];
  aiRecommendations: AiRecommendation[];
}

const DB_PATH = path.resolve(process.cwd(), 'prep_pilot_db.json');

function getInitialData(): DatabaseData {
  return {
    users: [],
    exams: [],
    studyMaterials: [],
    questionPapers: [],
    testAttempts: [],
    scheduleTasks: [],
    studySessions: [],
    aiRecommendations: []
  };
}

class Database {
  private data: DatabaseData;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseData {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load database from disk, using defaults', e);
    }
    const init = getInitialData();
    this.saveData(init);
    return init;
  }

  private saveData(data: DatabaseData) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database to disk', e);
    }
  }

  public getData(): DatabaseData {
    return this.data;
  }

  public persist() {
    this.saveData(this.data);
  }

  public clearAllData(): DatabaseData {
    this.data = {
      users: [],
      exams: [],
      studyMaterials: [],
      questionPapers: [],
      testAttempts: [],
      scheduleTasks: [],
      studySessions: [],
      aiRecommendations: []
    };
    this.persist();
    return this.data;
  }

  // Users
  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // Exams
  public getExamsByUser(userId: string): Exam[] {
    return this.data.exams.filter(e => e.userId === userId && !e.isArchived);
  }

  public getAllExamsByUser(userId: string): Exam[] {
    return this.data.exams.filter(e => e.userId === userId);
  }

  public getExamById(id: string): Exam | undefined {
    return this.data.exams.find(e => e.id === id);
  }

  public createExam(exam: Exam): Exam {
    this.data.exams.push(exam);
    this.persist();
    return exam;
  }

  public updateExam(id: string, updates: Partial<Exam>): Exam | undefined {
    const idx = this.data.exams.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    this.data.exams[idx] = { ...this.data.exams[idx], ...updates };
    this.persist();
    return this.data.exams[idx];
  }

  public deleteExam(id: string): boolean {
    const before = this.data.exams.length;
    this.data.exams = this.data.exams.filter(e => e.id !== id);
    // Cascade remove related items
    this.data.scheduleTasks = this.data.scheduleTasks.filter(t => t.examId !== id);
    this.data.studyMaterials = this.data.studyMaterials.filter(m => m.examId !== id);
    this.data.questionPapers = this.data.questionPapers.filter(p => p.examId !== id);
    this.data.testAttempts = this.data.testAttempts.filter(a => a.examId !== id);
    this.data.aiRecommendations = this.data.aiRecommendations.filter(r => r.examId !== id);
    this.persist();
    return this.data.exams.length < before;
  }

  // Materials
  public getMaterialsByExam(examId: string): StudyMaterial[] {
    return this.data.studyMaterials.filter(m => m.examId === examId);
  }

  public getMaterialsByUser(userId: string): StudyMaterial[] {
    return this.data.studyMaterials.filter(m => m.userId === userId);
  }

  public getMaterialById(id: string): StudyMaterial | undefined {
    return this.data.studyMaterials.find(m => m.id === id);
  }

  public createMaterial(material: StudyMaterial): StudyMaterial {
    this.data.studyMaterials.unshift(material);
    this.persist();
    return material;
  }

  public deleteMaterial(id: string): boolean {
    const before = this.data.studyMaterials.length;
    this.data.studyMaterials = this.data.studyMaterials.filter(m => m.id !== id);
    this.persist();
    return this.data.studyMaterials.length < before;
  }

  // Question Papers
  public getPapersByUser(userId: string): QuestionPaper[] {
    return this.data.questionPapers.filter(p => p.userId === userId);
  }

  public getPapersByExam(examId: string): QuestionPaper[] {
    return this.data.questionPapers.filter(p => p.examId === examId);
  }

  public getPaperById(id: string): QuestionPaper | undefined {
    return this.data.questionPapers.find(p => p.id === id);
  }

  public createPaper(paper: QuestionPaper): QuestionPaper {
    this.data.questionPapers.unshift(paper);
    this.persist();
    return paper;
  }

  public deletePaper(id: string): boolean {
    const before = this.data.questionPapers.length;
    this.data.questionPapers = this.data.questionPapers.filter(p => p.id !== id);
    this.persist();
    return this.data.questionPapers.length < before;
  }

  // Attempts
  public getAttemptsByUser(userId: string): TestAttempt[] {
    return this.data.testAttempts.filter(a => a.userId === userId);
  }

  public getAttemptsByExam(examId: string): TestAttempt[] {
    return this.data.testAttempts.filter(a => a.examId === examId);
  }

  public getAttemptsByPaper(paperId: string): TestAttempt[] {
    return this.data.testAttempts.filter(a => a.paperId === paperId);
  }

  public getAttemptById(id: string): TestAttempt | undefined {
    return this.data.testAttempts.find(a => a.id === id);
  }

  public createAttempt(attempt: TestAttempt): TestAttempt {
    this.data.testAttempts.unshift(attempt);
    this.persist();
    return attempt;
  }

  // Tasks
  public getTasksByExam(examId: string): ScheduleTask[] {
    return this.data.scheduleTasks.filter(t => t.examId === examId);
  }

  public getAllTasksByUser(userId: string): ScheduleTask[] {
    const examIds = new Set(this.data.exams.filter(e => e.userId === userId).map(e => e.id));
    return this.data.scheduleTasks.filter(t => examIds.has(t.examId));
  }

  public getTaskById(id: string): ScheduleTask | undefined {
    return this.data.scheduleTasks.find(t => t.id === id);
  }

  public createTask(task: ScheduleTask): ScheduleTask {
    this.data.scheduleTasks.push(task);
    this.persist();
    return task;
  }

  public updateTask(id: string, updates: Partial<ScheduleTask>): ScheduleTask | undefined {
    const idx = this.data.scheduleTasks.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.data.scheduleTasks[idx] = { ...this.data.scheduleTasks[idx], ...updates };
    this.persist();
    return this.data.scheduleTasks[idx];
  }

  public deleteTask(id: string): boolean {
    const before = this.data.scheduleTasks.length;
    this.data.scheduleTasks = this.data.scheduleTasks.filter(t => t.id !== id);
    this.persist();
    return this.data.scheduleTasks.length < before;
  }

  public replaceFutureTasks(examId: string, fromDateStr: string, newTasks: ScheduleTask[]) {
    // Preserve completed / past tasks
    this.data.scheduleTasks = this.data.scheduleTasks.filter(t => {
      if (t.examId !== examId) return true;
      if (t.date < fromDateStr || t.status === 'Completed' || t.status === 'Partially Completed') {
        return true;
      }
      return false;
    });
    this.data.scheduleTasks.push(...newTasks);
    this.persist();
  }

  // Study Sessions
  public getSessionsByUser(userId: string): StudySession[] {
    return this.data.studySessions.filter(s => s.userId === userId);
  }

  public createSession(session: StudySession): StudySession {
    this.data.studySessions.unshift(session);
    this.persist();
    return session;
  }

  // AI Recommendations
  public getRecommendationsByUser(userId: string): AiRecommendation[] {
    return this.data.aiRecommendations.filter(r => r.userId === userId);
  }

  public getRecommendationsByExam(examId: string): AiRecommendation[] {
    return this.data.aiRecommendations.filter(r => r.examId === examId);
  }

  public updateRecommendation(id: string, updates: Partial<AiRecommendation>): AiRecommendation | undefined {
    const idx = this.data.aiRecommendations.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    this.data.aiRecommendations[idx] = { ...this.data.aiRecommendations[idx], ...updates };
    this.persist();
    return this.data.aiRecommendations[idx];
  }

  public createRecommendation(rec: AiRecommendation): AiRecommendation {
    this.data.aiRecommendations.unshift(rec);
    this.persist();
    return rec;
  }
}

export const db = new Database();
