import React, { useState, useEffect, useRef } from 'react';
import { api } from './services/api';
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
} from './types';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StudyTimerModal } from './components/StudyTimerModal';

import { DashboardView } from './components/views/DashboardView';
import { ExamsView } from './components/views/ExamsView';
import { MaterialsView } from './components/views/MaterialsView';
import { QuestionGeneratorView } from './components/views/QuestionGeneratorView';
import { PapersView } from './components/views/PapersView';
import { OnlineTestView } from './components/views/OnlineTestView';
import { SchedulerView } from './components/views/SchedulerView';
import { CoachView } from './components/views/CoachView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { StudyHistoryView } from './components/views/StudyHistoryView';
import { SettingsView } from './components/views/SettingsView';
import { AuthView } from './components/views/AuthView';

export default function App() {
  // Navigation & Theme
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('preppilot_theme') as 'light' | 'dark') || 'light';
  });

  // Core Data
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Study Session Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync theme to HTML root element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('preppilot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Timer interval handling
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Initial load
  const loadAllData = async (examId?: string | null) => {
    try {
      const [u, exList, matList, papList, attList, tskList, recList, ov, stats] = await Promise.all([
        api.getMe(),
        api.getExams(),
        api.getMaterials(examId || undefined),
        api.getPapers(examId || undefined),
        api.getAttempts(examId ? { examId } : undefined),
        api.getTasks(examId || undefined),
        api.getRecommendations(examId || undefined),
        api.getDashboardOverview(examId || undefined),
        api.getSystemStats()
      ]);

      setUser(u);
      setExams(exList || []);
      setMaterials(matList || []);
      setPapers(papList || []);
      setAttempts(attList || []);
      setTasks(tskList || []);
      setRecommendations(recList || []);
      setOverview(ov);
      setSystemStats(stats);

      if (u?.preferences?.theme && !localStorage.getItem('preppilot_theme')) {
        setTheme(u.preferences.theme);
      }

      // If no registered user exists, open register page
      if (!u) {
        setCurrentView('register');
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(selectedExamId);
  }, [selectedExamId]);

  const handleSelectExam = (id: string | null) => {
    setSelectedExamId(id);
  };

  const handleNavigate = (view: string, extra?: any) => {
    setCurrentView(view);
    setNavigationParams(extra || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fast Study action from Dashboard or Scheduler
  const handleStartStudy = (examId?: string, subject?: string, topic?: string) => {
    setIsTimerRunning(true);
    setIsTimerModalOpen(true);
  };

  const handleSaveTimerSession = async (data: any) => {
    await api.logStudySession(data);
    await loadAllData(selectedExamId);
  };

  // Exam actions
  const handleCreateExam = async (examData: Partial<Exam>) => {
    const created = await api.createExam(examData);
    await loadAllData(created.id);
    return created;
  };

  const handleUpdateExam = async (id: string, examData: Partial<Exam>) => {
    const updated = await api.updateExam(id, examData);
    await loadAllData(selectedExamId);
    return updated;
  };

  const handleDeleteExam = async (id: string) => {
    const res = await api.deleteExam(id);
    await loadAllData(null);
    return res;
  };

  // Task actions
  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await api.updateTask(taskId, {
      status: newStatus,
      actualMinutesSpent: newStatus === 'Completed' ? task.durationMinutes : 0
    });
    await loadAllData(selectedExamId);
  };

  const handleUpdateTask = async (id: string, updates: Partial<ScheduleTask>) => {
    const res = await api.updateTask(id, updates);
    await loadAllData(selectedExamId);
    return res;
  };

  const handleCreateTask = async (taskData: Partial<ScheduleTask>) => {
    const res = await api.createCustomTask(taskData);
    await loadAllData(selectedExamId);
    return res;
  };

  const handleDeleteTask = async (id: string) => {
    const res = await api.deleteTask(id);
    await loadAllData(selectedExamId);
    return res;
  };

  const handleRegenerateSchedule = async (params: any) => {
    const res = await api.generateSchedule(params);
    await loadAllData(selectedExamId);
    return res;
  };

  // Material actions
  const handleUploadText = async (data: any) => {
    const res = await api.uploadTextMaterial(data);
    await loadAllData(selectedExamId);
    return res;
  };

  const handleDeleteMaterial = async (id: string) => {
    const res = await api.deleteMaterial(id);
    await loadAllData(selectedExamId);
    return res;
  };

  // Question generator actions
  const handleGenerateQuestions = async (params: any) => {
    return api.generateQuestions(params);
  };

  const handleSavePaper = async (paperData: Partial<QuestionPaper>) => {
    const res = await api.savePaper(paperData);
    await loadAllData(selectedExamId);
    return res;
  };

  const handleDuplicatePaper = async (id: string) => {
    const res = await api.duplicatePaper(id);
    await loadAllData(selectedExamId);
    return res;
  };

  const handleDeletePaper = async (id: string) => {
    const res = await api.deletePaper(id);
    await loadAllData(selectedExamId);
    return res;
  };

  // Test Submission
  const handleSubmitTest = async (testData: any) => {
    const res = await api.submitTest(testData);
    await loadAllData(selectedExamId);
    return res;
  };

  // Coach recommendations
  const handleUpdateRecommendation = async (id: string, updates: Partial<AiRecommendation>) => {
    const res = await api.updateRecommendation(id, updates);
    await loadAllData(selectedExamId);
    return res;
  };

  const handleRefreshCoach = async (examId?: string) => {
    const res = await api.refreshCoach(examId);
    await loadAllData(selectedExamId);
    return res;
  };

  // Preferences
  const handleUpdatePreferences = async (prefs: Partial<User['preferences']>) => {
    const res = await api.updatePreferences(prefs);
    await loadAllData(selectedExamId);
    return res;
  };

  // User Auth & Registration Handlers
  const handleLogin = async (email: string, password?: string) => {
    const res = await api.login(email, password);
    await loadAllData(null);
    return res;
  };

  const handleRegister = async (name: string, email: string, password?: string, preferences?: any) => {
    const res = await api.register(name, email, password, preferences);
    await loadAllData(null);
    return res;
  };

  const handleLogout = () => {
    localStorage.removeItem('preppilot_token');
    loadAllData(null);
  };

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to completely remove ALL sample and user data from the database? This resets the entire database to a clean empty state.')) {
      return;
    }
    await api.clearAllDatabase();
    setUser(null);
    setSelectedExamId(null);
    setCurrentView('register');
    await loadAllData(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-bounce flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <span className="font-extrabold text-lg">P</span>
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          Initializing PrepPilot AI Engine...
        </p>
      </div>
    );
  }

  const selectedExam = exams.find(e => e.id === selectedExamId);

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        user={user}
        exams={exams}
        selectedExamId={selectedExamId}
        onSelectExam={handleSelectExam}
        activeTimerSeconds={timerSeconds}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning(prev => !prev)}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
      />

      {/* Main Layout */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          overdueTasksCount={overview?.overdueTasksCount}
          weakTopicsCount={overview?.weakTopics.length}
          streakDays={overview?.currentStudyStreakDays}
          activeExamName={selectedExam?.name}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentView === 'dashboard' && (
            <DashboardView
              overview={overview}
              exams={exams}
              selectedExamId={selectedExamId}
              onNavigate={handleNavigate}
              onCompleteTask={handleCompleteTask}
              onStartStudy={handleStartStudy}
            />
          )}

          {currentView === 'exams' && (
            <ExamsView
              exams={exams}
              selectedExamId={selectedExamId}
              onSelectExam={handleSelectExam}
              onCreateExam={handleCreateExam}
              onUpdateExam={handleUpdateExam}
              onDeleteExam={handleDeleteExam}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'materials' && (
            <MaterialsView
              materials={materials}
              exams={exams}
              selectedExamId={selectedExamId}
              onUploadText={handleUploadText}
              onDeleteMaterial={handleDeleteMaterial}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'generator' && (
            <QuestionGeneratorView
              exams={exams}
              materials={materials}
              selectedExamId={selectedExamId}
              initialParams={navigationParams}
              onGenerate={handleGenerateQuestions}
              onSavePaper={handleSavePaper}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'papers' && (
            <PapersView
              papers={papers}
              exams={exams}
              selectedPaperId={navigationParams?.paperId}
              onDuplicatePaper={handleDuplicatePaper}
              onDeletePaper={handleDeletePaper}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'online-test' && (
            <OnlineTestView
              papers={papers}
              exams={exams}
              selectedPaperId={navigationParams?.paperId}
              mode={navigationParams?.mode || 'online'}
              onSubmitTest={handleSubmitTest}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'scheduler' && (
            <SchedulerView
              tasks={tasks}
              exams={exams}
              selectedExamId={selectedExamId}
              onUpdateTask={handleUpdateTask}
              onCreateTask={handleCreateTask}
              onDeleteTask={handleDeleteTask}
              onRegenerateSchedule={handleRegenerateSchedule}
              onStartStudy={handleStartStudy}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'coach' && (
            <CoachView
              recommendations={recommendations}
              attempts={attempts}
              exams={exams}
              selectedExamId={selectedExamId}
              onUpdateRecommendation={handleUpdateRecommendation}
              onRefreshCoach={handleRefreshCoach}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              attempts={attempts}
              exams={exams}
              tasks={tasks}
              selectedExamId={selectedExamId}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'history' && (
            <StudyHistoryView
              tasks={tasks}
              attempts={attempts}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              user={user}
              onUpdatePreferences={handleUpdatePreferences}
              onNavigate={handleNavigate}
              theme={theme}
              onToggleTheme={toggleTheme}
              systemStats={systemStats}
              onClearDatabase={handleClearDatabase}
            />
          )}

          {(currentView === 'auth' || currentView === 'register' || currentView === 'login') && (
            <AuthView
              currentUser={user}
              initialMode={navigationParams?.mode || (currentView === 'login' ? 'login' : 'register')}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>

      {/* Creator Copyright Signature Footer */}
      <footer className="no-print w-full py-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">atharvacybercafe</span>
            <span>• All Rights Reserved.</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <span>Creator Copyright Signature:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">atharvacybercafe</span>
          </div>
        </div>
      </footer>

      {/* Floating Active Study Timer Modal */}
      <StudyTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        timerSeconds={timerSeconds}
        isRunning={isTimerRunning}
        onToggleRun={() => setIsTimerRunning(prev => !prev)}
        onReset={() => {
          setIsTimerRunning(false);
          setTimerSeconds(0);
        }}
        onSaveSession={handleSaveTimerSession}
        exams={exams}
        selectedExamId={selectedExamId}
      />
    </div>
  );
}
