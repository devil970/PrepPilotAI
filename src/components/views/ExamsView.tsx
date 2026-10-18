import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  PlusCircle,
  Trash2,
  Edit2,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronDown,
  Layers,
  X
} from 'lucide-react';
import { Exam, ExamSubject, ExamTopic } from '../../types';

interface ExamsViewProps {
  exams: Exam[];
  selectedExamId: string | null;
  onSelectExam: (id: string | null) => void;
  onCreateExam: (data: Partial<Exam>) => Promise<any>;
  onUpdateExam: (id: string, data: Partial<Exam>) => Promise<any>;
  onDeleteExam: (id: string) => Promise<any>;
  onNavigate: (view: string, extra?: any) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  selectedExamId,
  onSelectExam,
  onCreateExam,
  onUpdateExam,
  onDeleteExam,
  onNavigate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exam['category']>('Competitive');
  const [examDate, setExamDate] = useState('');
  const [dailyAvailableHours, setDailyAvailableHours] = useState(3.5);
  const [targetScore, setTargetScore] = useState(85);
  const [difficultyPreference, setDifficultyPreference] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [notes, setNotes] = useState('');
  const [preferredStudyDays, setPreferredStudyDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]);

  // Subjects & Topics in Modal
  const [subjects, setSubjects] = useState<Array<{ name: string; topics: string }>>([
    { name: '', topics: '' }
  ]);

  const activeExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const calculateDaysRemaining = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const handleOpenCreate = () => {
    setEditingExamId(null);
    setName('');
    setCategory('Competitive');
    const defaultDate = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];
    setExamDate(defaultDate);
    setDailyAvailableHours(3.5);
    setTargetScore(85);
    setDifficultyPreference('Medium');
    setPreferredLanguage('English');
    setNotes('');
    setSubjects([{ name: 'General Studies', topics: 'Indian Constitution, Economy, Modern History' }]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    setName(exam.name);
    setCategory(exam.category);
    setExamDate(exam.examDate);
    setDailyAvailableHours(exam.dailyAvailableHours);
    setTargetScore(exam.targetScore);
    setDifficultyPreference(exam.difficultyPreference);
    setPreferredLanguage(exam.preferredLanguage);
    setNotes(exam.notes);
    setPreferredStudyDays(exam.preferredStudyDays);
    setSubjects(
      exam.subjects.map(s => ({
        name: s.name,
        topics: s.topics.map(t => t.name).join(', ')
      }))
    );
    setIsModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !examDate) return;

    const formattedSubjects = subjects
      .filter(s => s.name.trim().length > 0)
      .map(s => ({
        name: s.name.trim(),
        topics: s.topics
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0)
          .map(t => ({ name: t, difficulty: 'Medium', estimatedHours: 5 }))
      }));

    const payload: Partial<Exam> = {
      name,
      category,
      examDate,
      dailyAvailableHours: Number(dailyAvailableHours),
      targetScore: Number(targetScore),
      difficultyPreference,
      preferredLanguage,
      notes,
      preferredStudyDays,
      subjects: formattedSubjects as any
    };

    if (editingExamId) {
      await onUpdateExam(editingExamId, payload);
    } else {
      const created = await onCreateExam(payload);
      if (created?.id) onSelectExam(created.id);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, examName: string) => {
    if (confirm(`Are you sure you want to delete "${examName}" and all its scheduled tasks, papers, and analysis? This action cannot be undone.`)) {
      await onDeleteExam(id);
      if (selectedExamId === id) onSelectExam(null);
    }
  };

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (preferredStudyDays.includes(day)) {
      if (preferredStudyDays.length > 1) {
        setPreferredStudyDays(preferredStudyDays.filter(d => d !== day));
      }
    } else {
      setPreferredStudyDays([...preferredStudyDays, day]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>AI Exam & Syllabus Manager</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain independent dashboards, countdown clocks, syllabi, and custom schedules for each exam.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Examination</span>
        </button>
      </div>

      {/* Exam Switcher Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {exams.map((ex) => {
          const isSelected = (activeExam?.id === ex.id);
          const daysLeft = calculateDaysRemaining(ex.examDate);

          return (
            <button
              key={ex.id}
              onClick={() => onSelectExam(ex.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{ex.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {daysLeft}d left
              </span>
            </button>
          );
        })}
      </div>

      {/* Independent Exam Dashboard for Selected Exam */}
      {activeExam ? (
        <div className="space-y-6">
          {/* Hero Card for Current Exam */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                    {activeExam.category}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Created on {new Date(activeExam.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {activeExam.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  {activeExam.notes || 'No specialized instructions provided for this exam.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500">
                  <span>🎯 Target Score: <strong>{activeExam.targetScore}%</strong></span>
                  <span>•</span>
                  <span>⏳ Daily Study Time: <strong>{activeExam.dailyAvailableHours} hrs</strong></span>
                  <span>•</span>
                  <span>🌐 Language: <strong>{activeExam.preferredLanguage}</strong></span>
                </div>
              </div>

              {/* Countdown & Quick Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <div className="bg-gradient-to-tr from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-center min-w-[160px]">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Countdown Clock
                  </span>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono block mt-1">
                    {calculateDaysRemaining(activeExam.examDate)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Days Remaining Until Exam</span>
                  <div className="text-[10px] text-slate-400 mt-1">Date: {activeExam.examDate}</div>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleOpenEdit(activeExam)}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Exam Settings</span>
                  </button>
                  <button
                    onClick={() => onNavigate('generator', { examId: activeExam.id })}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-transform active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate MCQs</span>
                  </button>
                  {exams.length > 1 && (
                    <button
                      onClick={() => handleDelete(activeExam.id, activeExam.name)}
                      className="flex items-center justify-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Exam</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subjects & Syllabus Topics Explorer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Subjects & Topics Breakdown</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track topic-wise difficulty, estimated hours, and test accuracy.
                </p>
              </div>

              <button
                onClick={() => handleOpenEdit(activeExam)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Add Subject / Topic
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeExam.subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subj.color || '#3B82F6' }} />
                      <span className="truncate">{subj.name}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {subj.topics.length} topics
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {subj.topics.map((top) => (
                      <div
                        key={top.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-xs"
                      >
                        <span className="truncate pr-2 font-medium text-slate-800 dark:text-slate-200">
                          {top.name}
                        </span>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              top.difficulty === 'Hard'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : top.difficulty === 'Medium'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {top.difficulty}
                          </span>
                          <button
                            onClick={() =>
                              onNavigate('generator', {
                                examId: activeExam.id,
                                subject: subj.name,
                                topic: top.name,
                                difficulty: top.difficulty
                              })
                            }
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Generate test for this topic"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Exams Configured Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
            Create your first examination target (e.g., UGC NET, GATE, UPSC, College Semester) to start tracking your syllabus and generating intelligent day-by-day schedules.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Exam</span>
          </button>
        </div>
      )}

      {/* Create / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {editingExamId ? 'Edit Examination Parameters' : 'Create New Examination Target'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Provide exam dates, target goals, and syllabus topics to configure AI study schedules and tests.
            </p>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. UGC NET Computer Science"
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="Competitive">Competitive (NET, GATE, UPSC, Banking)</option>
                    <option value="College Semester">College Semester / University</option>
                    <option value="Entrance">Entrance Exam (JEE, NEET, CAT)</option>
                    <option value="Government">Government Recruitment</option>
                    <option value="Certification">Professional Certification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Study Time (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="14"
                    value={dailyAvailableHours}
                    onChange={(e) => setDailyAvailableHours(parseFloat(e.target.value))}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Score (%)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Available Study Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysList.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        preferredStudyDays.includes(day)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subjects & Topics Input Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Syllabus Subjects & Topics
                  </label>
                  <button
                    type="button"
                    onClick={() => setSubjects([...subjects, { name: '', topics: '' }])}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Add Another Subject
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {subjects.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => {
                            const copy = [...subjects];
                            copy[idx].name = e.target.value;
                            setSubjects(copy);
                          }}
                          placeholder={`Subject Name (e.g. DBMS, Networking)`}
                          className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                        />
                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSubjects(subjects.filter((_, i) => i !== idx))}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={s.topics}
                        onChange={(e) => {
                          const copy = [...subjects];
                          copy[idx].topics = e.target.value;
                          setSubjects(copy);
                        }}
                        placeholder="Comma-separated topics (e.g. Normalization, SQL Joins, Concurrency)"
                        className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes & Special Goals
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Target cutoff, revision priorities, reference books, etc."
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  {editingExamId ? 'Save & Recalculate Schedule' : 'Create Exam & Generate Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
