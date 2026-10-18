export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
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

export interface ExamTopic {
  id: string;
  subjectId: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  isCompleted: boolean;
  accuracyRate?: number;
}

export interface ExamSubject {
  id: string;
  examId: string;
  name: string;
  color: string;
  topics: ExamTopic[];
}

export interface Exam {
  id: string;
  userId: string;
  name: string;
  category: 'Competitive' | 'College Semester' | 'Entrance' | 'Government' | 'Certification';
  examDate: string;
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
  date: string;
  startTime: string;
  endTime: string;
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

export interface DashboardOverview {
  activeExamsCount: number;
  examCountdowns: Array<{
    examId: string;
    name: string;
    category: string;
    examDate: string;
    days: number;
    hours: number;
    minutes: number;
    isPassed: boolean;
  }>;
  todayTargetMinutes: number;
  todayCompletedMinutes: number;
  syllabusCompletionPercentage: number;
  totalGeneratedPapers: number;
  totalTestsAttempted: number;
  averageTestScore: number;
  difficultyPerformance: {
    Easy: { total: number; correct: number; accuracy: number };
    Medium: { total: number; correct: number; accuracy: number };
    Hard: { total: number; correct: number; accuracy: number };
  };
  currentStudyStreakDays: number;
  weakTopics: Array<{
    topic: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  overdueTasksCount: number;
  overdueTasks: ScheduleTask[];
  todayTasks: ScheduleTask[];
  recentAttempts: TestAttempt[];
  aiRecommendations: AiRecommendation[];
}
