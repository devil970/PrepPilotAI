import {
  User,
  Exam,
  QuestionPaper,
  Question,
  TestAttempt,
  ScheduleTask,
  StudyMaterial,
  AiRecommendation,
  DashboardOverview
} from '../types';

const BASE_URL = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('preppilot_token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const api = {
  // Auth
  async login(email: string, password?: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    const data = await res.json();
    localStorage.setItem('preppilot_token', data.token);
    return data;
  },

  async register(name: string, email: string, password?: string, preferences?: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, preferences })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
    const data = await res.json();
    localStorage.setItem('preppilot_token', data.token);
    return data;
  },

  async getMe(): Promise<User | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.authenticated === false || !data.id) return null;
      return data as User;
    } catch {
      return null;
    }
  },

  async updatePreferences(prefs: Partial<User['preferences']>): Promise<any> {
    const res = await fetch(`${BASE_URL}/auth/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(prefs)
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/admin/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin users');
    return res.json();
  },

  // Exams
  async getExams(): Promise<Exam[]> {
    const res = await fetch(`${BASE_URL}/exams`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch exams');
    return res.json();
  },

  async getExam(id: string): Promise<Exam> {
    const res = await fetch(`${BASE_URL}/exams/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch exam');
    return res.json();
  },

  async createExam(data: Partial<Exam>): Promise<Exam> {
    const res = await fetch(`${BASE_URL}/exams`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create exam');
    return res.json();
  },

  async updateExam(id: string, data: Partial<Exam>): Promise<Exam> {
    const res = await fetch(`${BASE_URL}/exams/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update exam');
    return res.json();
  },

  async deleteExam(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/exams/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete exam');
    return res.json();
  },

  // Study Materials
  async getMaterials(examId?: string): Promise<StudyMaterial[]> {
    const url = examId ? `${BASE_URL}/materials?examId=${examId}` : `${BASE_URL}/materials`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch materials');
    return res.json();
  },

  async uploadTextMaterial(data: {
    title: string;
    text: string;
    fileName?: string;
    examId: string;
    subjectId?: string;
    isOcrApplied?: boolean;
  }): Promise<StudyMaterial> {
    const res = await fetch(`${BASE_URL}/materials/upload-text`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    return res.json();
  },

  async deleteMaterial(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete material');
    return res.json();
  },

  // Question Papers & AI MCQ Generator
  async generateQuestions(params: {
    subject: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    questionCount: number;
    language: string;
    marksPerQuestion: number;
    negativeMarksPerQuestion: number;
    studyMaterialId?: string;
    rawText?: string;
    useOnlyUploadedMaterial?: boolean;
  }): Promise<{ success: boolean; questions: Question[]; metadata: any }> {
    const res = await fetch(`${BASE_URL}/questions/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate questions');
    return res.json();
  },

  async getPapers(examId?: string): Promise<QuestionPaper[]> {
    const url = examId ? `${BASE_URL}/papers?examId=${examId}` : `${BASE_URL}/papers`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch papers');
    return res.json();
  },

  async getPaper(id: string): Promise<QuestionPaper> {
    const res = await fetch(`${BASE_URL}/papers/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch paper');
    return res.json();
  },

  async savePaper(data: Partial<QuestionPaper>): Promise<QuestionPaper> {
    const res = await fetch(`${BASE_URL}/papers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to save paper');
    return res.json();
  },

  async duplicatePaper(id: string): Promise<QuestionPaper> {
    const res = await fetch(`${BASE_URL}/papers/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to duplicate paper');
    return res.json();
  },

  async deletePaper(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/papers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete paper');
    return res.json();
  },

  // Test Attempt & Scoring
  async submitTest(data: {
    paperId: string;
    examId?: string;
    mode: 'online' | 'manual-entry';
    userAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
    startedAt?: string;
    timeTakenSeconds?: number;
  }): Promise<TestAttempt> {
    const res = await fetch(`${BASE_URL}/tests/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Submission failed');
    return res.json();
  },

  async getAttempts(filter?: { examId?: string; paperId?: string }): Promise<TestAttempt[]> {
    let url = `${BASE_URL}/tests/attempts`;
    if (filter?.paperId) url += `?paperId=${filter.paperId}`;
    else if (filter?.examId) url += `?examId=${filter.examId}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch attempts');
    return res.json();
  },

  async getAttemptDetail(id: string): Promise<{ attempt: TestAttempt; paper: QuestionPaper }> {
    const res = await fetch(`${BASE_URL}/tests/attempts/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch attempt details');
    return res.json();
  },

  // Schedules
  async getTasks(examId?: string): Promise<ScheduleTask[]> {
    const url = examId ? `${BASE_URL}/schedules/tasks?examId=${examId}` : `${BASE_URL}/schedules/tasks`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async generateSchedule(params: {
    examId: string;
    startDate?: string;
    dailyHours?: number;
    availableDays?: string[];
    startTime?: string;
  }): Promise<{ success: boolean; taskCount: number; tasks: ScheduleTask[] }> {
    const res = await fetch(`${BASE_URL}/schedules/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate schedule');
    return res.json();
  },

  async updateTask(id: string, updates: Partial<ScheduleTask>): Promise<ScheduleTask> {
    const res = await fetch(`${BASE_URL}/schedules/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async createCustomTask(task: Partial<ScheduleTask>): Promise<ScheduleTask> {
    const res = await fetch(`${BASE_URL}/schedules/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async deleteTask(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/schedules/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  // Study Sessions
  async logStudySession(data: {
    examId?: string;
    subject?: string;
    topic?: string;
    durationMinutes: number;
    mode?: 'timer' | 'manual';
    notes?: string;
  }): Promise<any> {
    const res = await fetch(`${BASE_URL}/study-sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to log study session');
    return res.json();
  },

  // AI Coach Recommendations
  async getRecommendations(examId?: string): Promise<AiRecommendation[]> {
    const url = examId ? `${BASE_URL}/coach/recommendations?examId=${examId}` : `${BASE_URL}/coach/recommendations`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async updateRecommendation(id: string, updates: Partial<AiRecommendation>): Promise<AiRecommendation> {
    const res = await fetch(`${BASE_URL}/coach/recommendations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update recommendation');
    return res.json();
  },

  async refreshCoach(examId?: string): Promise<AiRecommendation[]> {
    const res = await fetch(`${BASE_URL}/coach/refresh`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ examId })
    });
    if (!res.ok) throw new Error('Failed to refresh recommendations');
    return res.json();
  },

  // Analytics Overview
  async getDashboardOverview(examId?: string): Promise<DashboardOverview> {
    const url = examId ? `${BASE_URL}/analytics/overview?examId=${examId}` : `${BASE_URL}/analytics/overview`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard overview');
    return res.json();
  },

  async getSystemStats(): Promise<any> {
    const res = await fetch(`${BASE_URL}/system/stats`, { headers: getHeaders() });
    return res.json();
  },

  async clearAllDatabase(): Promise<any> {
    const res = await fetch(`${BASE_URL}/database/clear-all`, {
      method: 'POST',
      headers: getHeaders()
    });
    localStorage.removeItem('preppilot_token');
    return res.json();
  }
};
