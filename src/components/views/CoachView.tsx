import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  TrendingUp,
  Brain
} from 'lucide-react';
import { AiRecommendation, Exam, TestAttempt } from '../../types';

interface CoachViewProps {
  recommendations: AiRecommendation[];
  attempts: TestAttempt[];
  exams: Exam[];
  selectedExamId: string | null;
  onUpdateRecommendation: (id: string, updates: Partial<AiRecommendation>) => Promise<any>;
  onRefreshCoach: (examId?: string) => Promise<any>;
  onNavigate: (view: string, extra?: any) => void;
}

export const CoachView: React.FC<CoachViewProps> = ({
  recommendations,
  attempts,
  exams,
  selectedExamId,
  onUpdateRecommendation,
  onRefreshCoach,
  onNavigate
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeExam = exams.find(e => e.id === selectedExamId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshCoach(selectedExamId || undefined);
    } catch (e: any) {
      alert(e.message || 'Failed to refresh coach analysis');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleComplete = async (rec: AiRecommendation) => {
    await onUpdateRecommendation(rec.id, { isCompleted: !rec.isCompleted });
  };

  // Compute stats for coach
  const weakTopicStats: Record<string, { total: number; correct: number; subject: string }> = {};
  attempts.forEach(a => {
    Object.entries(a.topicWisePerformance).forEach(([top, stats]) => {
      if (!weakTopicStats[top]) {
        weakTopicStats[top] = { total: 0, correct: 0, subject: a.paperTitle.split('-')[0]?.trim() || 'General' };
      }
      weakTopicStats[top].total += stats.total;
      weakTopicStats[top].correct += stats.correct;
    });
  });

  const weakList = Object.entries(weakTopicStats)
    .map(([topic, stats]) => ({
      topic,
      subject: stats.subject,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }))
    .filter(t => t.total >= 1 && t.accuracy < 65)
    .sort((a, b) => a.accuracy - b.accuracy);

  const strongList = Object.entries(weakTopicStats)
    .map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }))
    .filter(t => t.total >= 1 && t.accuracy >= 75)
    .sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Bot className="w-6 h-6 text-purple-600" />
            <span>AI Performance Analysis & Improvement Coach</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Empirical diagnostic engine that evaluates real test mistakes and prescribes targeted revision and question practice.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-md shadow-purple-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRefreshing ? 'Analyzing Test Data...' : 'Refresh Diagnostic Prescriptions'}</span>
        </button>
      </div>

      {/* Top Coach Insight Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg space-y-4">
        <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Brain className="w-4 h-4 text-cyan-300" />
          <span>Continuous Learning Diagnostic</span>
        </div>
        <h3 className="text-xl font-bold">
          {attempts.length === 0
            ? 'No Test Records Found. Take a Diagnostic Paper to Calibrate!'
            : weakList.length > 0
            ? `Identified ${weakList.length} High-Priority Concept Deficits`
            : 'All Examined Topics Demonstrating Above 75% Mastery!'}
        </h3>
        <p className="text-xs text-purple-200/90 max-w-2xl leading-relaxed">
          {attempts.length === 0
            ? 'PrepPilot AI grounds its recommendations strictly in real question attempt records. Generate and attempt your first MCQ paper to unlock precision diagnostic prescriptions.'
            : 'Recommendations below prescribe exact revision minutes, tailored difficulty levels (Easy/Medium), and targeted follow-up test sets.'}
        </p>

        {attempts.length === 0 && (
          <button
            onClick={() => onNavigate('generator')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-950 hover:bg-purple-50 inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Take Diagnostic Mock Test</span>
          </button>
        )}
      </div>

      {/* Prescriptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Actionable Prescriptions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Actionable Prescriptions ({recommendations.length})
          </h4>

          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    rec.isCompleted
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {rec.category}
                      </span>
                      <h4 className={`text-sm font-bold text-slate-900 dark:text-white mt-1.5 ${rec.isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {rec.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleToggleComplete(rec)}
                      className={`p-1.5 rounded-xl border text-xs flex items-center space-x-1 shrink-0 ${
                        rec.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:border-emerald-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{rec.isCompleted ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {rec.actionablePrescription}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">
                    <span className="text-slate-400 text-[11px]">
                      Recommended: <strong>{rec.suggestedAction.recommendedMinutes} mins</strong> ({rec.suggestedAction.difficulty} Difficulty)
                    </span>

                    <button
                      onClick={() =>
                        onNavigate('generator', {
                          subject: rec.subject,
                          topic: rec.topic,
                          difficulty: rec.suggestedAction.difficulty,
                          questionCount: rec.suggestedAction.questionCount || 10
                        })
                      }
                      className="inline-flex items-center space-x-1.5 font-bold text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <span>Generate {rec.suggestedAction.difficulty} Diagnostic MCQs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                All Current Recommendations Resolved!
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Take another test paper to re-evaluate and check whether performance improved.
              </p>
            </div>
          )}
        </div>

        {/* Strong vs Weak Concepts Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weak Topics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Needs Targeted Revision (&lt;65%)</span>
            </h4>

            {weakList.length > 0 ? (
              <div className="space-y-2">
                {weakList.map((wt, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs">
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-900 dark:text-white truncate">{wt.topic}</span>
                      <span className="text-rose-600 font-bold">{wt.accuracy}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {wt.correct} correct out of {wt.total} attempted
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No critical weak topics flagged.</p>
            )}
          </div>

          {/* Strong Topics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center space-x-1.5">
              <Award className="w-4 h-4" />
              <span>Strong Concepts (&gt;=75%)</span>
            </h4>

            {strongList.length > 0 ? (
              <div className="space-y-2">
                {strongList.map((st, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-900 dark:text-white truncate">{st.topic}</span>
                      <span className="text-emerald-600 font-bold">{st.accuracy}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {st.correct} correct out of {st.total} attempted
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Complete more tests to confirm strong areas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
