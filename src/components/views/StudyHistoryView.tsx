import React from 'react';
import {
  History,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  ShieldCheck,
  FileCheck,
  Award
} from 'lucide-react';
import { ScheduleTask, TestAttempt } from '../../types';

interface StudyHistoryViewProps {
  tasks: ScheduleTask[];
  attempts: TestAttempt[];
  onNavigate: (view: string) => void;
}

export const StudyHistoryView: React.FC<StudyHistoryViewProps> = ({
  tasks,
  attempts,
  onNavigate
}) => {
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const skippedTasks = tasks.filter(t => t.status === 'Skipped');

  const totalStudyMinutes = completedTasks.reduce(
    (sum, t) => sum + (t.actualMinutesSpent || t.durationMinutes),
    0
  );

  // Group study minutes by date for consistency streak
  const studyDates = new Set(completedTasks.map(t => t.date));

  // Subject-wise study hours breakdown
  const subjectTime: Record<string, number> = {};
  completedTasks.forEach(t => {
    subjectTime[t.subject] = (subjectTime[t.subject] || 0) + (t.actualMinutesSpent || t.durationMinutes);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <History className="w-6 h-6 text-indigo-600" />
          <span>Study Time & Activity History</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Measured productive focus blocks with idle detection, task completions, and test timeline logs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Measured Study</span>
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {(totalStudyMinutes / 60).toFixed(1)}h
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Productive active minutes</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Completed Study Tasks</span>
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {completedTasks.length}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">({skippedTasks.length} skipped)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Tests Evaluated</span>
          <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {attempts.length}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">MCQ papers taken</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Idle Protection</span>
          <span className="text-sm font-bold text-emerald-600 flex items-center space-x-1 mt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Active & Filtered</span>
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Excludes inactive tabs</span>
        </div>
      </div>

      {/* Grid: Subject Allocation & Activity History Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject-wise study hours breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Study Hours by Subject
          </h4>

          {Object.keys(subjectTime).length > 0 ? (
            <div className="space-y-3 pt-2">
              {Object.entries(subjectTime).map(([subj, mins]) => {
                const percent = totalStudyMinutes > 0 ? Math.round((mins / totalStudyMinutes) * 100) : 0;
                return (
                  <div key={subj} className="text-xs">
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-800 dark:text-slate-200 truncate">{subj}</span>
                      <span className="font-mono">{(mins / 60).toFixed(1)}h ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No study tasks completed yet.</p>
          )}
        </div>

        {/* Detailed Timeline Log (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chronological Activity Stream
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {completedTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Completed: {t.topic}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {t.subject} • {t.date} ({t.durationMinutes} minutes productive focus)
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {t.taskType}
                </span>
              </div>
            ))}

            {attempts.map((att) => (
              <div
                key={att.id}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-purple-50/30 dark:bg-purple-950/20 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Test Submitted: {att.paperTitle}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      Score: {att.totalMarksObtained}/{att.maxPossibleMarks} ({att.scorePercentage}%) • Completed on {new Date(att.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {att.accuracyPercentage}% Accuracy
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
