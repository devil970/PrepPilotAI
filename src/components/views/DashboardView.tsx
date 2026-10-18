import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Award,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Bot,
  PlusCircle,
  Layers,
  ChevronRight
} from 'lucide-react';
import { DashboardOverview, Exam } from '../../types';

interface DashboardViewProps {
  overview: DashboardOverview | null;
  exams: Exam[];
  selectedExamId: string | null;
  onNavigate: (view: string, extra?: any) => void;
  onCompleteTask: (taskId: string) => void;
  onStartStudy: (examId?: string, subject?: string, topic?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overview,
  exams,
  selectedExamId,
  onNavigate,
  onCompleteTask,
  onStartStudy
}) => {
  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const selectedExam = exams.find(e => e.id === selectedExamId);

  // Filtered countdown if specific exam selected
  const activeCountdowns = selectedExamId
    ? overview.examCountdowns.filter(c => c.examId === selectedExamId)
    : overview.examCountdowns;

  const targetHours = (overview.todayTargetMinutes / 60).toFixed(1);
  const completedHours = (overview.todayCompletedMinutes / 60).toFixed(1);
  const targetPercent = overview.todayTargetMinutes > 0
    ? Math.min(100, Math.round((overview.todayCompletedMinutes / overview.todayTargetMinutes) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Exam Mode Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-950/10">
        <div>
          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>
              {selectedExam ? `Focused Dashboard: ${selectedExam.name}` : 'PrepPilot Master Dashboard'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {selectedExam ? selectedExam.name : 'Welcome Back, Future Topper!'}
          </h1>
          <p className="text-indigo-200/90 text-xs sm:text-sm mt-1 max-w-xl">
            {selectedExam
              ? `Target Score: ${selectedExam.targetScore}% • Category: ${selectedExam.category} • Prepared with AI Study Plan.`
              : `Tracking ${overview.activeExamsCount} active exams with personalized AI study schedules and real performance diagnostics.`}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('generator', { examId: selectedExamId })}
            className="flex items-center space-x-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Generate MCQ Paper</span>
          </button>
          <button
            onClick={() => onNavigate('exams')}
            className="flex items-center space-x-2 bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-400/40 text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>All Exams</span>
          </button>
        </div>
      </div>

      {/* Primary Exam Countdown Cards */}
      {activeCountdowns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCountdowns.map((cd) => (
            <div
              key={cd.examId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
              onClick={() => onNavigate('exams', { examId: cd.examId })}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {cd.category}
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{cd.examDate}</span>
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base truncate mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {cd.name}
              </h3>

              {cd.isPassed ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-semibold text-center">
                  Exam Date Has Passed
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="block text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {cd.days}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Days
                    </span>
                  </div>
                  <div>
                    <span className="block text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {cd.hours}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Hours
                    </span>
                  </div>
                  <div>
                    <span className="block text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {cd.minutes}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Mins
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Active Exams Configured</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Create your first examination target to generate a custom day-by-day scheduler and syllabus tracker.
          </p>
          <button
            onClick={() => onNavigate('exams')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Exam Target</span>
          </button>
        </div>
      )}

      {/* Core Summary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Target */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Today's Target</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {completedHours}h
            </span>
            <span className="text-xs text-slate-400">of {targetHours}h goal</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 block">
            {targetPercent}% completed today
          </span>
        </div>

        {/* Syllabus Completion */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Syllabus Covered</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {overview.syllabusCompletionPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${overview.syllabusCompletionPercentage}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 block">
            Across registered curriculum units
          </span>
        </div>

        {/* Tests & Average Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Average Test Score</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {overview.averageTestScore}%
            </span>
            <span className="text-xs text-slate-400">
              ({overview.totalTestsAttempted} tests taken)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all ${
                overview.averageTestScore >= 75 ? 'bg-purple-500' : 'bg-amber-500'
              }`}
              style={{ width: `${overview.averageTestScore}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 block">
            {overview.totalGeneratedPapers} question papers created
          </span>
        </div>

        {/* Study Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Consistency Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {overview.currentStudyStreakDays} Days
            </span>
          </div>
          <div className="flex items-center space-x-1 mt-2.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < Math.min(7, overview.currentStudyStreakDays)
                    ? 'bg-amber-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 block">
            Continuous daily preparation
          </span>
        </div>
      </div>

      {/* Difficulty Breakdown & Weak Topics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center justify-between">
            <span>Accuracy by Difficulty</span>
            <span className="text-xs font-normal text-slate-400">Based on past tests</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-600 dark:text-emerald-400">Easy Questions</span>
                <span>{overview.difficultyPerformance.Easy.accuracy}% ({overview.difficultyPerformance.Easy.correct}/{overview.difficultyPerformance.Easy.total})</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${overview.difficultyPerformance.Easy.accuracy}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-600 dark:text-blue-400">Medium Questions</span>
                <span>{overview.difficultyPerformance.Medium.accuracy}% ({overview.difficultyPerformance.Medium.correct}/{overview.difficultyPerformance.Medium.total})</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${overview.difficultyPerformance.Medium.accuracy}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-600 dark:text-rose-400">Hard Questions</span>
                <span>{overview.difficultyPerformance.Hard.accuracy}% ({overview.difficultyPerformance.Hard.correct}/{overview.difficultyPerformance.Hard.total})</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${overview.difficultyPerformance.Hard.accuracy}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">Need harder challenge?</span>
            <button
              onClick={() => onNavigate('generator', { difficulty: 'Hard' })}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Generate Hard Paper →
            </button>
          </div>
        </div>

        {/* Weak Topics Diagnostic Alert */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Identified Weak Topics (&lt;60% Accuracy)</span>
            </h3>
            <button
              onClick={() => onNavigate('coach')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <span>AI Coach Prescriptions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overview.weakTopics.length > 0 ? (
            <div className="space-y-3">
              {overview.weakTopics.slice(0, 4).map((wt, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 gap-2"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{wt.topic}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Accuracy: <span className="text-rose-600 dark:text-rose-400 font-bold">{wt.accuracy}%</span> ({wt.correct}/{wt.total} correct)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onNavigate('generator', { topic: wt.topic, difficulty: 'Easy' })}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                    >
                      Practice Easy MCQs
                    </button>
                    <button
                      onClick={() => onStartStudy(undefined, undefined, wt.topic)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                    >
                      Study Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No major weak topics detected!
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Take more diagnostic test papers to uncover deeper conceptual gaps.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Tasks & Overdue Scheduler Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Study Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Today's Study Plan</span>
            </h3>
            <button
              onClick={() => onNavigate('scheduler')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Calendar →
            </button>
          </div>

          {overview.todayTasks && overview.todayTasks.length > 0 ? (
            <div className="space-y-2.5">
              {overview.todayTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    t.status === 'Completed'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onCompleteTask(t.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        t.status === 'Completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                    >
                      {t.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          t.status === 'Completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {t.topic}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.subject} • {t.startTime} - {t.endTime} ({t.durationMinutes}m) •{' '}
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {t.taskType}
                        </span>
                      </p>
                    </div>
                  </div>

                  {t.status !== 'Completed' && (
                    <button
                      onClick={() => onStartStudy(t.examId, t.subject, t.topic)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                    >
                      Start
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No scheduled tasks remaining for today.</p>
              <button
                onClick={() => onNavigate('scheduler')}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
              >
                Generate Next Study Tasks
              </button>
            </div>
          )}
        </div>

        {/* AI Recommendations Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span>AI Coach Recommendations</span>
            </h3>
            <button
              onClick={() => onNavigate('coach')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Prescriptions →
            </button>
          </div>

          {overview.aiRecommendations && overview.aiRecommendations.length > 0 ? (
            <div className="space-y-3">
              {overview.aiRecommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/60"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-purple-900 dark:text-purple-300 truncate">
                      {rec.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-200/60 dark:bg-purple-900 text-purple-800 dark:text-purple-200 uppercase">
                      {rec.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                    {rec.actionablePrescription}
                  </p>
                  <button
                    onClick={() =>
                      onNavigate('generator', {
                        subject: rec.subject,
                        topic: rec.topic,
                        difficulty: rec.suggestedAction.difficulty
                      })
                    }
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
                  >
                    <span>Execute Prescription</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No active prescriptions. Keep taking tests to unlock recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
