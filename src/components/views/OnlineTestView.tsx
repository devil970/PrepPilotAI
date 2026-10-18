import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Flag,
  FileCheck,
  Award,
  TrendingDown,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuestionPaper, TestAttempt, Exam } from '../../types';

interface OnlineTestViewProps {
  papers: QuestionPaper[];
  exams: Exam[];
  selectedPaperId?: string | null;
  mode?: 'online' | 'manual-entry';
  onSubmitTest: (data: any) => Promise<TestAttempt>;
  onNavigate: (view: string, extra?: any) => void;
}

export const OnlineTestView: React.FC<OnlineTestViewProps> = ({
  papers,
  exams,
  selectedPaperId,
  mode = 'online',
  onSubmitTest,
  onNavigate
}) => {
  const [activePaperId, setActivePaperId] = useState<string>(selectedPaperId || papers[0]?.id || '');
  const [testMode, setTestMode] = useState<'online' | 'manual-entry'>(mode);

  const activePaper = papers.find(p => p.id === activePaperId) || papers[0];

  // Test Running State
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(900);
  const [testStartedAt, setTestStartedAt] = useState<string>('');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  // Manual entry text input state
  const [manualInputString, setManualInputString] = useState<string>('');

  // Result state
  const [testResult, setTestResult] = useState<TestAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedPaperId) {
      setActivePaperId(selectedPaperId);
    }
  }, [selectedPaperId]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartTest = (chosenMode: 'online' | 'manual-entry') => {
    if (!activePaper) return;
    setTestMode(chosenMode);
    setUserAnswers({});
    setReviewFlags({});
    setTestResult(null);
    setCurrentQuestionIndex(0);
    setManualInputString('');

    const durationSec = (activePaper.durationMinutes || 15) * 60;
    setRemainingSeconds(durationSec);
    setTestStartedAt(new Date().toISOString());
    setIsTestActive(true);

    if (chosenMode === 'online') {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleSelectOption = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === option ? null : option // toggle option or deselect
    }));
  };

  const toggleReviewFlag = (questionId: string) => {
    setReviewFlags((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleParseManualInput = () => {
    // Parses string like "1-A, 2-C, 3-B, 4-D" or "1A 2C 3B"
    if (!activePaper) return;
    const newAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | null> = { ...userAnswers };

    const regex = /(\d+)\s*[-:]?\s*([A-Da-d])/g;
    let match;
    while ((match = regex.exec(manualInputString)) !== null) {
      const qNum = parseInt(match[1], 10);
      const opt = match[2].toUpperCase() as 'A' | 'B' | 'C' | 'D';
      if (qNum >= 1 && qNum <= activePaper.questions.length) {
        const targetQ = activePaper.questions[qNum - 1];
        if (targetQ) {
          newAnswers[targetQ.id] = opt;
        }
      }
    }
    setUserAnswers(newAnswers);
  };

  const handleAutoSubmit = () => {
    handleCompleteSubmit();
  };

  const handleCompleteSubmit = async () => {
    if (!activePaper || isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalDuration = (activePaper.durationMinutes || 15) * 60;
    const timeTaken = Math.max(1, totalDuration - remainingSeconds);

    try {
      const result = await onSubmitTest({
        paperId: activePaper.id,
        examId: activePaper.examId,
        mode: testMode,
        userAnswers,
        startedAt: testStartedAt,
        timeTakenSeconds: timeTaken
      });

      setTestResult(result);
      setIsTestActive(false);

      if (result.scorePercentage >= 70) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            <span>Interactive Online Test & Answer Verification</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Solve tests with timed countdowns, auto-scoring, negative marking, and instant explanation reviews.
          </p>
        </div>
      </div>

      {/* Test Launch Screen when NOT active and NO result */}
      {!isTestActive && !testResult && (
        papers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              No Question Papers Available Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Generate your first examination paper (from 5 up to 100 questions) to attempt timed online tests or enter printed answer sheets for automated grading.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('generator')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate MCQ Question Paper</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Question Paper to Attempt
              </label>
              <select
                value={activePaperId}
                onChange={(e) => setActivePaperId(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white"
              >
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>
                    📝 {p.title} ({p.totalQuestions} Questions • {p.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {activePaper ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200 mb-2">
                  {activePaper.title}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Subject</span>
                    <strong>{activePaper.subject}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Questions</span>
                    <strong>{activePaper.totalQuestions} MCQs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Marks</span>
                    <strong>{activePaper.totalMarks} Marks</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Negative Marking</span>
                    <strong className="text-rose-600">-{activePaper.negativeMarkingPerQuestion} Marks</strong>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Test Guidelines & Scoring Formula
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-5">
                  {activePaper.instructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                  <li>
                    Formula: Total Score = (Correct × Marks) - (Incorrect × {activePaper.negativeMarkingPerQuestion}).
                  </li>
                  <li>Unanswered questions receive zero marks. Answers are auto-submitted when the timer expires.</li>
                </ul>
              </div>

              {/* Choose Mode Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleStartTest('online')}
                  className="p-5 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/60 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1">
                    <Clock className="w-5 h-5" />
                    <span>Mode 1: Timed Interactive Test</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Live timer countdown, single question view, mark-for-review navigation, and instant auto-grading.
                  </p>
                  <span className="mt-3 inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                    <span>Start Online Test</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>

                <button
                  onClick={() => handleStartTest('manual-entry')}
                  className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-bold text-sm mb-1">
                    <FileCheck className="w-5 h-5 text-purple-600" />
                    <span>Mode 2: Enter Printed Answers</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Solved on printed paper? Enter your answers (e.g. 1-A, 2-C) or click the OMR bubbles to verify.
                  </p>
                  <span className="mt-3 inline-flex items-center space-x-1 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                    <span>Open Answer Sheet</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ))}

      {/* ACTIVE TEST INTERFACE */}
      {isTestActive && activePaper && (
        <div className="space-y-6">
          {/* Sticky Test Header Bar */}
          <div className="sticky top-14 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate max-w-md">
                {activePaper.title}
              </h3>
              <p className="text-xs text-slate-500">
                Question {currentQuestionIndex + 1} of {activePaper.questions.length} • Marks: {activePaper.questions[currentQuestionIndex]?.marks} (Neg: -{activePaper.negativeMarkingPerQuestion})
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {testMode === 'online' && (
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-mono text-sm font-extrabold border ${
                    remainingSeconds < 180
                      ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{formatCountdown(remainingSeconds)}</span>
                </div>
              )}

              <button
                onClick={handleCompleteSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Test'}
              </button>
            </div>
          </div>

          {/* Test Mode 1: Interactive Question Viewer */}
          {testMode === 'online' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Active Question Box (8 cols) */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                {activePaper.questions[currentQuestionIndex] && (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                        Q{currentQuestionIndex + 1}. {activePaper.questions[currentQuestionIndex].questionText}
                      </span>
                      <button
                        onClick={() => toggleReviewFlag(activePaper.questions[currentQuestionIndex].id)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                          reviewFlags[activePaper.questions[currentQuestionIndex].id]
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{reviewFlags[activePaper.questions[currentQuestionIndex].id] ? 'Marked' : 'Mark Review'}</span>
                      </button>
                    </div>

                    {/* 4 Options Selection */}
                    <div className="space-y-3 pt-2">
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                        const qId = activePaper.questions[currentQuestionIndex].id;
                        const isSelected = userAnswers[qId] === opt;

                        return (
                          <div
                            key={opt}
                            onClick={() => handleSelectOption(qId, opt)}
                            className={`p-4 rounded-2xl border-2 flex items-start space-x-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 text-indigo-950 dark:text-indigo-200 shadow-sm'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {opt}
                            </span>
                            <span className="text-sm font-medium leading-relaxed">
                              {activePaper.questions[currentQuestionIndex].options[opt]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Question</span>
                      </button>

                      <button
                        onClick={() =>
                          setUserAnswers((prev) => ({
                            ...prev,
                            [activePaper.questions[currentQuestionIndex].id]: null
                          }))
                        }
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        Clear Response
                      </button>

                      <button
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(activePaper.questions.length - 1, prev + 1)
                          )
                        }
                        disabled={currentQuestionIndex === activePaper.questions.length - 1}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-md shadow-indigo-600/20"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Question Navigation Palette (4 cols) */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Question Palette
                </h4>

                <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                  {activePaper.questions.map((q, idx) => {
                    const isAnswered = Boolean(userAnswers[q.id]);
                    const isMarked = Boolean(reviewFlags[q.id]);
                    const isCurrent = currentQuestionIndex === idx;

                    let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                    if (isAnswered) bgClass = 'bg-emerald-600 text-white font-bold';
                    if (isMarked) bgClass = 'bg-amber-500 text-white font-bold';
                    if (isCurrent) bgClass += ' ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900';

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all ${bgClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-600 shrink-0" />
                    <span>Answered ({Object.values(userAnswers).filter(Boolean).length})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded bg-amber-500 shrink-0" />
                    <span>Marked for Review ({Object.values(reviewFlags).filter(Boolean).length})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <span>
                      Unattempted (
                        {activePaper.questions.length - Object.values(userAnswers).filter(Boolean).length}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Quick Answer-Entry Grid & Text Box */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Printed Paper Response Sheet
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Click the appropriate letter for each question or paste a formatted response string below (e.g. <code>1-A, 2-C, 3-B, 4-D</code>).
                </p>
              </div>

              {/* String Input parser */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quick Input String
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualInputString}
                    onChange={(e) => setManualInputString(e.target.value)}
                    placeholder="e.g. 1-A, 2-C, 3-B, 4-D"
                    className="flex-1 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleParseManualInput}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              {/* Grid of OMR Bubbles */}
              <div className="space-y-3">
                {activePaper.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white w-8">
                        Q{idx + 1}.
                      </span>
                      <span className="text-xs text-slate-500 truncate max-w-md hidden sm:inline">
                        {q.questionText}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                        const isSelected = userAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`w-8 h-8 rounded-full text-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                      <button
                        onClick={() =>
                          setUserAnswers((prev) => ({ ...prev, [q.id]: null }))
                        }
                        className="text-[10px] text-slate-400 hover:text-slate-600 ml-2"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAILED TEST RESULT REVIEW SCREEN */}
      {testResult && activePaper && (
        <div className="space-y-6">
          {/* Result Score Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Performance Evaluation Report
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {testResult.paperTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attempted via {testResult.mode === 'online' ? 'Interactive Timed Mode' : 'Printable Answer Verification'} • Completed on {new Date(testResult.completedAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleStartTest(testMode)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Test</span>
                </button>
                <button
                  onClick={() => onNavigate('coach')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View AI Coach Feedback</span>
                </button>
              </div>
            </div>

            {/* Score Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Score</span>
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono block mt-1">
                  {testResult.totalMarksObtained}
                </span>
                <span className="text-[11px] text-slate-500">out of {testResult.maxPossibleMarks} marks</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Accuracy</span>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                  {testResult.accuracyPercentage}%
                </span>
                <span className="text-[11px] text-slate-500">of attempted answers</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Correct / Wrong</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono block mt-1">
                  <span className="text-emerald-600">{testResult.correctAnswers}</span> /{' '}
                  <span className="text-rose-600">{testResult.incorrectAnswers}</span>
                </span>
                <span className="text-[11px] text-slate-500">({testResult.unattempted} unattempted)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Time Taken</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono block mt-1">
                  {Math.floor(testResult.timeTakenSeconds / 60)}m {testResult.timeTakenSeconds % 60}s
                </span>
                <span className="text-[11px] text-slate-500">Pace: ~{Math.round(testResult.timeTakenSeconds / testResult.totalQuestions)}s / question</span>
              </div>
            </div>

            {/* Topic & Difficulty Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  Topic-wise Accuracy
                </h5>
                <div className="space-y-2">
                  {Object.entries(testResult.topicWisePerformance).map(([top, stats]) => {
                    const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                    return (
                      <div key={top} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{top}</span>
                          <span className="font-bold">{acc}% ({stats.correct}/{stats.total})</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${acc >= 70 ? 'bg-emerald-500' : acc >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${acc}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  Difficulty-wise Performance
                </h5>
                <div className="space-y-2">
                  {Object.entries(testResult.difficultyWisePerformance).map(([diff, stats]) => {
                    const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                    return (
                      <div key={diff} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{diff}</span>
                          <span className="font-bold">{acc}% ({stats.correct}/{stats.total})</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${diff === 'Hard' ? 'bg-rose-500' : diff === 'Medium' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                            style={{ width: `${acc}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Question-by-Question Review */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Detailed Question Analysis & Explanation
            </h4>

            {activePaper.questions.map((q, idx) => {
              const userAns = testResult.answers.find(a => a.questionId === q.id);
              const isCorrect = userAns?.isCorrect;
              const isUnattempted = !userAns?.userSelectedOption;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border text-xs space-y-3 ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : isUnattempted
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-slate-900 dark:text-white text-sm leading-relaxed">
                      Q{idx + 1}. {q.questionText}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 flex items-center space-x-1 ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isUnattempted
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>+{userAns?.marksAwarded} Marks</span>
                        </>
                      ) : isUnattempted ? (
                        <span>0 Marks (Unattempted)</span>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>{userAns?.marksAwarded} Marks</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const isCorrectOpt = q.correctOption === opt;
                      const isChosenByUser = userAns?.userSelectedOption === opt;

                      let optClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                      if (isCorrectOpt) {
                        optClass = 'bg-emerald-100/70 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-800 font-bold text-emerald-900 dark:text-emerald-200';
                      } else if (isChosenByUser && !isCorrectOpt) {
                        optClass = 'bg-rose-100/70 dark:bg-rose-950/50 border-rose-400 dark:border-rose-800 font-bold text-rose-900 dark:text-rose-200 line-through';
                      }

                      return (
                        <div key={opt} className={`p-2.5 rounded-xl border flex items-center space-x-2 ${optClass}`}>
                          <span className="font-bold shrink-0">({opt})</span>
                          <span>{q.options[opt]}</span>
                          {isCorrectOpt && <span className="ml-auto text-[10px] text-emerald-700">✓ Correct</span>}
                          {isChosenByUser && !isCorrectOpt && <span className="ml-auto text-[10px] text-rose-700">✗ Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white">Explanation: </strong>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</span>
                    {q.sourceReference && (
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Source Reference: {q.sourceReference}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
