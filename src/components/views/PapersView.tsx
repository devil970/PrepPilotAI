import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Key,
  Copy,
  Trash2,
  Play,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  Award,
  BookOpen,
  ArrowLeft,
  Download,
  Sparkles
} from 'lucide-react';
import { QuestionPaper, Exam } from '../../types';

interface PapersViewProps {
  papers: QuestionPaper[];
  exams: Exam[];
  selectedPaperId?: string | null;
  onDuplicatePaper: (id: string) => Promise<any>;
  onDeletePaper: (id: string) => Promise<any>;
  onNavigate: (view: string, extra?: any) => void;
}

export const PapersView: React.FC<PapersViewProps> = ({
  papers,
  exams,
  selectedPaperId,
  onDuplicatePaper,
  onDeletePaper,
  onNavigate
}) => {
  const [activePaperId, setActivePaperId] = useState<string | null>(selectedPaperId || papers[0]?.id || null);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);
  const [isAnswerKeyOnlyMode, setIsAnswerKeyOnlyMode] = useState<boolean>(false);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});

  const toggleRevealQuestion = (qId: string) => {
    setRevealedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  useEffect(() => {
    if (selectedPaperId) {
      setActivePaperId(selectedPaperId);
      setRevealedQuestions({});
    }
  }, [selectedPaperId]);

  const activePaper = papers.find(p => p.id === activePaperId) || papers[0];
  const exam = exams.find(e => e.id === activePaper?.examId);

  const handlePrint = (answerKeyOnly: boolean = false) => {
    setIsAnswerKeyOnlyMode(answerKeyOnly);
    setShowAnswerKey(answerKeyOnly);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDuplicate = async (id: string) => {
    const copy = await onDuplicatePaper(id);
    if (copy?.id) setActivePaperId(copy.id);
  };

  return (
    <div className="space-y-6">
      {/* Action Header - hidden during print */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <span>Printable Question Papers & Official Answer Keys</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard A4 examination papers without answers for students, plus independently aligned official answer keys with explanations.
          </p>
        </div>

        {activePaper && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handlePrint(false)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print Question Paper PDF</span>
            </button>

            <button
              onClick={() => {
                setShowAnswerKey(!showAnswerKey);
                setIsAnswerKeyOnlyMode(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                showAnswerKey
                  ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200'
              }`}
            >
              {showAnswerKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-amber-600" />}
              <span>{showAnswerKey ? 'Hide Answer Key' : 'Click to See Answers'}</span>
            </button>

            <button
              onClick={() => onNavigate('online-test', { paperId: activePaper.id, mode: 'online' })}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Online Test</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Paper Repository Selector (4 cols) - hidden on print */}
        <div className="no-print lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Generated Question Papers ({papers.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {papers.length === 0 ? (
                <div className="text-center py-8 px-2 space-y-2">
                  <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">No question papers created yet.</p>
                  <button
                    onClick={() => onNavigate('generator')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Generate New Paper
                  </button>
                </div>
              ) : (
                papers.map((p) => {
                  const isSelected = activePaper?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActivePaperId(p.id);
                        setIsAnswerKeyOnlyMode(false);
                        setShowAnswerKey(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                        {p.title}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          p.difficulty === 'Hard'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                            : p.difficulty === 'Medium'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <p>{p.subject} • {p.topic}</p>
                      <p>{p.totalQuestions} Questions • {p.totalMarks} Marks • {p.durationMinutes} Mins</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(p.id);
                          }}
                          className="text-slate-400 hover:text-indigo-600 p-1"
                          title="Duplicate paper"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete question paper "${p.title}"?`)) onDeletePaper(p.id);
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Delete paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* Printable A4 Paper Document Preview (8 cols) */}
        <div className="lg:col-span-8">
          {activePaper ? (
            <div className="space-y-4">
              {/* Preview Toggle Controls - hidden on print */}
              <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3 text-xs">
                  <button
                    onClick={() => {
                      setIsAnswerKeyOnlyMode(false);
                      setShowAnswerKey(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors ${
                      !isAnswerKeyOnlyMode && !showAnswerKey
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Question Paper Mode (Answers Protected)
                  </button>

                  <button
                    onClick={() => {
                      setIsAnswerKeyOnlyMode(false);
                      setShowAnswerKey(!showAnswerKey);
                    }}
                    className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-xl font-bold border transition-colors ${
                      showAnswerKey
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border-purple-300'
                        : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-900 dark:text-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{showAnswerKey ? 'Hide Answers' : 'Click to See Answers'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAnswerKeyOnlyMode(true);
                      setShowAnswerKey(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      isAnswerKeyOnlyMode
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Answer Key Only
                  </button>
                </div>

                {showAnswerKey && (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      id="incExpl"
                      checked={includeExplanations}
                      onChange={(e) => setIncludeExplanations(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <label htmlFor="incExpl">Include Explanations in Answer Key</label>
                  </div>
                )}
              </div>

              {/* Printable Document Sheet (A4 Styled) */}
              <div className="print-container bg-white text-black p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl mx-auto font-serif">
                {/* Official Exam Header */}
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                    {exam?.name || 'PrepPilot Standard Examination'}
                  </h1>
                  <h2 className="text-base font-bold mt-1">
                    {activePaper.title}
                  </h2>
                  <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-xs mt-2 font-sans font-medium">
                    <span>Subject: <strong>{activePaper.subject}</strong></span>
                    <span>Topic: <strong>{activePaper.topic}</strong></span>
                    <span>Difficulty: <strong>{activePaper.difficulty}</strong></span>
                    <span>Date: <strong>{new Date(activePaper.createdAt).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="flex justify-between text-xs mt-3 font-sans font-bold pt-2 border-t border-slate-300">
                    <span>Total Questions: {activePaper.totalQuestions}</span>
                    <span>Time Allowed: {activePaper.durationMinutes} Minutes</span>
                    <span>Maximum Marks: {activePaper.totalMarks}</span>
                  </div>
                </div>

                {/* Student Identification Box (Standard Examination) */}
                {!isAnswerKeyOnlyMode && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border border-black p-3 text-xs font-sans mb-6">
                    <div>
                      <span className="font-bold">Student Name: </span>
                      <span className="border-b border-black inline-block w-36"></span>
                    </div>
                    <div>
                      <span className="font-bold">Roll Number: </span>
                      <span className="border-b border-black inline-block w-28"></span>
                    </div>
                    <div>
                      <span className="font-bold">Invigilator Sig: </span>
                      <span className="border-b border-black inline-block w-24"></span>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {!isAnswerKeyOnlyMode && (
                  <div className="text-xs font-sans mb-6 bg-slate-50 p-3 border border-slate-200">
                    <span className="font-bold uppercase tracking-wider block mb-1">
                      Instructions for Candidates:
                    </span>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                      {activePaper.instructions.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                      <li>Darken exactly one bubble or mark the correct option letter.</li>
                    </ol>
                  </div>
                )}

                {/* Questions Section - Official Paper Format (Answers Protected by default) */}
                {!isAnswerKeyOnlyMode && (
                  <div className="space-y-6">
                    {activePaper.questions.map((q, idx) => {
                      const isRevealed = revealedQuestions[q.id] || showAnswerKey;
                      return (
                        <div key={q.id} className="question-item text-sm">
                          <div className="flex justify-between font-bold mb-2">
                            <span>Q{idx + 1}. {q.questionText}</span>
                            <span className="text-xs font-sans text-slate-500 shrink-0 ml-2">
                              [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-4 text-xs font-sans">
                            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                              <div key={opt} className="flex items-start space-x-2">
                                <span className="font-bold">({opt})</span>
                                <span>{q.options[opt]}</span>
                              </div>
                            ))}
                          </div>

                          {/* Individual See Answer Button */}
                          <div className="no-print mt-3 pt-2 pl-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 font-sans">
                            <button
                              type="button"
                              onClick={() => toggleRevealQuestion(q.id)}
                              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                isRevealed
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                              }`}
                            >
                              {isRevealed ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-purple-700" />
                                  <span>Hide Answer for Q{idx + 1}</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Click to See Answer for Q{idx + 1}</span>
                                </>
                              )}
                            </button>
                            <span className="text-[10px] text-slate-400">
                              {isRevealed ? 'Solution visible below' : 'Answer protected (practice mode)'}
                            </span>
                          </div>

                          {/* Revealed Answer & Explanation Block */}
                          {isRevealed && (
                            <div className="no-print mt-2 ml-4 p-3 rounded-xl bg-purple-50/90 border border-purple-200 font-sans text-xs text-purple-950 space-y-1 animate-fadeIn">
                              <div className="flex items-center space-x-2 font-bold">
                                <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-mono">
                                  Correct Option: ({q.correctOption})
                                </span>
                                <span className="text-purple-900 font-semibold">{q.options[q.correctOption]}</span>
                              </div>
                              <p className="text-slate-700 text-[11px] leading-relaxed pt-1">
                                <strong>Explanation:</strong> {q.explanation}
                              </p>
                            </div>
                          )}

                          {/* Space for rough work if printed */}
                          <div className="border-b border-dotted border-slate-300 pt-3 pb-1" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Answer Key Document (Separately generated or appended) */}
                {(showAnswerKey || isAnswerKeyOnlyMode) && (
                  <div className={`mt-10 ${!isAnswerKeyOnlyMode ? 'pt-8 border-t-2 border-black page-break-before' : ''}`}>
                    <div className="text-center border-b-2 border-black pb-3 mb-4">
                      <h3 className="text-lg font-black uppercase tracking-wider">
                        Official Answer Key & Scoring Guide
                      </h3>
                      <p className="text-xs font-sans font-medium text-slate-600">
                        {activePaper.title} • Negative Marking: -{activePaper.negativeMarkingPerQuestion} marks
                      </p>
                    </div>

                    {/* Quick Grid Summary */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6 font-sans text-center">
                      {activePaper.questions.map((q, i) => (
                        <div key={q.id} className="border border-black p-1 text-xs">
                          <span className="block font-bold text-slate-500 text-[10px]">Q{i + 1}</span>
                          <span className="block font-black text-sm text-indigo-700 font-mono">
                            {q.correctOption}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Explanations */}
                    {includeExplanations && (
                      <div className="space-y-4 font-sans text-xs">
                        <h4 className="font-bold uppercase text-slate-700 tracking-wider">
                          Detailed Explanations & Conceptual References:
                        </h4>
                        {activePaper.questions.map((q, i) => (
                          <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="font-bold">
                              Q{i + 1}. Correct Answer: Option ({q.correctOption}) – {q.options[q.correctOption]}
                            </span>
                            <p className="mt-1 text-slate-700 leading-relaxed">
                              {q.explanation}
                            </p>
                            {q.sourceReference && (
                              <p className="text-[10px] text-slate-400 mt-1 italic">
                                Reference: {q.sourceReference}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer with Creator Copyright Signature */}
                <div className="mt-12 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[10px] font-sans text-slate-500 gap-1">
                  <span>PrepPilot AI Examination Suite • Verified Document ID: {activePaper.id}</span>
                  <span className="font-bold text-slate-700">© Copyright: atharvacybercafe • All Rights Reserved</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No Question Papers Generated Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Generate high-quality multiple choice question papers (up to 100 questions) in official PDF format with protected answer keys.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('generator')}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Question Paper</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
