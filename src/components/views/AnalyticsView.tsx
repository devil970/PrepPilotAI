import React, { useState } from 'react';
import {
  LineChart,
  Award,
  Clock,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers
} from 'lucide-react';
import { TestAttempt, Exam, ScheduleTask } from '../../types';

interface AnalyticsViewProps {
  attempts: TestAttempt[];
  exams: Exam[];
  tasks: ScheduleTask[];
  selectedExamId: string | null;
  onNavigate: (view: string, extra?: any) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  attempts,
  exams,
  tasks,
  selectedExamId,
  onNavigate
}) => {
  const [examFilter, setExamFilter] = useState<string>(selectedExamId || 'all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const filteredAttempts = attempts.filter((a) => {
    if (examFilter !== 'all' && a.examId !== examFilter) return false;
    return true;
  });

  const totalAttempted = filteredAttempts.length;
  const avgScore = totalAttempted > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) / totalAttempted)
    : 0;
  const avgAccuracy = totalAttempted > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + a.accuracyPercentage, 0) / totalAttempted)
    : 0;

  // Aggregate questions stats
  const totalCorrect = filteredAttempts.reduce((sum, a) => sum + a.correctAnswers, 0);
  const totalIncorrect = filteredAttempts.reduce((sum, a) => sum + a.incorrectAnswers, 0);
  const totalUnattempted = filteredAttempts.reduce((sum, a) => sum + a.unattempted, 0);
  const totalAnsweredQuestions = totalCorrect + totalIncorrect + totalUnattempted;

  // Aggregate Topic Accuracy
  const topicStats: Record<string, { total: number; correct: number }> = {};
  filteredAttempts.forEach((a) => {
    Object.entries(a.topicWisePerformance).forEach(([top, stats]) => {
      if (!topicStats[top]) topicStats[top] = { total: 0, correct: 0 };
      topicStats[top].total += stats.total;
      topicStats[top].correct += stats.correct;
    });
  });

  const sortedTopics = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  // Difficulty Accuracy
  const diffStats: Record<string, { total: number; correct: number }> = {
    Easy: { total: 0, correct: 0 },
    Medium: { total: 0, correct: 0 },
    Hard: { total: 0, correct: 0 }
  };
  filteredAttempts.forEach((a) => {
    Object.entries(a.difficultyWisePerformance).forEach(([diff, stats]) => {
      if (diffStats[diff]) {
        diffStats[diff].total += stats.total;
        diffStats[diff].correct += stats.correct;
      }
    });
  });

  // Planned vs actual study time
  const plannedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const actualMinutes = tasks
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + (t.actualMinutesSpent || t.durationMinutes), 0);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <LineChart className="w-6 h-6 text-indigo-600" />
            <span>Performance Analytics & Examination Reports</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data-backed metrics derived strictly from actual test submissions, syllabus completion, and timed study sessions.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-black shadow-md self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Export Analytics Report (PDF)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <div>
            <label className="text-slate-400 mr-2 font-medium">Exam:</label>
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white"
            >
              <option value="all">All Examinations</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredAttempts.length}</strong> evaluated test attempts
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Average Test Score</span>
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {avgScore}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Across all attempted papers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Attempt Accuracy</span>
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {avgAccuracy}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">{totalCorrect} correct answers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Completed Study Time</span>
          <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {(actualMinutes / 60).toFixed(1)}h
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Planned: {(plannedMinutes / 60).toFixed(1)}h
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Question Volume</span>
          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {totalAnsweredQuestions}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">MCQs evaluated in system</span>
        </div>
      </div>

      {/* Main Analytics Grid: Score Trends & Question Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Score Chronological Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
            <span>Score Progression Over Time</span>
            <span className="text-xs font-normal text-slate-400">Recent tests</span>
          </h3>

          {filteredAttempts.length > 0 ? (
            <div className="space-y-3">
              {filteredAttempts.map((att, i) => (
                <div
                  key={att.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                      {att.paperTitle}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {new Date(att.completedAt).toLocaleDateString()} • {att.timeTakenSeconds}s • Mode: {att.mode}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block font-mono">
                        {att.scorePercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {att.totalMarksObtained}/{att.maxPossibleMarks} Marks
                      </span>
                    </div>

                    <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          att.scorePercentage >= 75
                            ? 'bg-emerald-500'
                            : att.scorePercentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${att.scorePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No test attempts recorded for this exam filter.
            </div>
          )}
        </div>

        {/* Question Correct / Incorrect / Unattempted Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Question Answer Distribution
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-600 flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Correct Answers</span>
                </span>
                <span className="font-mono">
                  {totalCorrect} (
                  {totalAnsweredQuestions > 0 ? Math.round((totalCorrect / totalAnsweredQuestions) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${totalAnsweredQuestions > 0 ? (totalCorrect / totalAnsweredQuestions) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-600 flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>Incorrect Answers (Negative Penalties Applied)</span>
                </span>
                <span className="font-mono">
                  {totalIncorrect} (
                  {totalAnsweredQuestions > 0 ? Math.round((totalIncorrect / totalAnsweredQuestions) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${totalAnsweredQuestions > 0 ? (totalIncorrect / totalAnsweredQuestions) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500 flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                  <span>Unattempted / Left Blank</span>
                </span>
                <span className="font-mono">
                  {totalUnattempted} (
                  {totalAnsweredQuestions > 0 ? Math.round((totalUnattempted / totalAnsweredQuestions) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full"
                  style={{ width: `${totalAnsweredQuestions > 0 ? (totalUnattempted / totalAnsweredQuestions) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Difficulty Mastery
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {(['Easy', 'Medium', 'Hard'] as const).map(d => {
                const item = diffStats[d];
                const rate = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
                return (
                  <div key={d} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 block">{d}</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                      {rate}%
                    </span>
                    <span className="text-[9px] text-slate-400">{item.correct}/{item.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Topic Accuracy Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Topic-wise Performance Matrix
        </h3>

        {sortedTopics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-2.5 pr-4">Topic Name</th>
                  <th className="py-2.5 px-4 text-center">Questions Attempted</th>
                  <th className="py-2.5 px-4 text-center">Correct Answers</th>
                  <th className="py-2.5 px-4">Accuracy Rate</th>
                  <th className="py-2.5 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedTopics.map((top, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                      {top.topic}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-400">
                      {top.total}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">
                      {top.correct}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-mono w-10">{top.accuracy}%</span>
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              top.accuracy >= 75
                                ? 'bg-emerald-500'
                                : top.accuracy >= 55
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${top.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          top.accuracy >= 75
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : top.accuracy >= 55
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {top.accuracy >= 75 ? 'Mastered' : top.accuracy >= 55 ? 'Moderate' : 'Needs Practice'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No topic evaluations recorded yet.</p>
        )}
      </div>
    </div>
  );
};
