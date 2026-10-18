import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Settings2,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Printer,
  Play,
  RotateCcw,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Download,
  ListOrdered
} from 'lucide-react';
import { Exam, StudyMaterial, Question, QuestionPaper } from '../../types';

interface QuestionGeneratorViewProps {
  exams: Exam[];
  materials: StudyMaterial[];
  selectedExamId: string | null;
  initialParams?: {
    examId?: string;
    subject?: string;
    topic?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    studyMaterialId?: string;
    rawText?: string;
  };
  onGenerate: (params: any) => Promise<{ success: boolean; questions: Question[]; metadata: any }>;
  onSavePaper: (data: Partial<QuestionPaper>) => Promise<QuestionPaper>;
  onNavigate: (view: string, extra?: any) => void;
}

export const QuestionGeneratorView: React.FC<QuestionGeneratorViewProps> = ({
  exams,
  materials,
  selectedExamId,
  initialParams,
  onGenerate,
  onSavePaper,
  onNavigate
}) => {
  const [examId, setExamId] = useState(initialParams?.examId || selectedExamId || exams[0]?.id || '');
  const activeExam = exams.find(e => e.id === examId) || exams[0];

  const [subject, setSubject] = useState(initialParams?.subject || activeExam?.subjects[0]?.name || 'General Studies');
  const [topic, setTopic] = useState(initialParams?.topic || activeExam?.subjects[0]?.topics[0]?.name || 'Core Fundamentals');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(initialParams?.difficulty || 'Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(10);
  const [language, setLanguage] = useState(activeExam?.preferredLanguage || 'English');
  const [marksPerQuestion, setMarksPerQuestion] = useState(2);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [studyMaterialId, setStudyMaterialId] = useState(initialParams?.studyMaterialId || '');
  const [useOnlyUploadedMaterial, setUseOnlyUploadedMaterial] = useState(false);
  const [includeExplanationsInKey, setIncludeExplanationsInKey] = useState(true);
  const [questionStyle, setQuestionStyle] = useState('Standard Exam MCQs');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [paperTitle, setPaperTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // CRITICAL USER REQUIREMENTS:
  // 1. First format must be PDF format preview!
  // 2. Do NOT show answers directly!
  // 3. Button to see answer (both global and per-question)
  const [displayFormat, setDisplayFormat] = useState<'pdf' | 'card'>('pdf'); // default to PDF format first
  const [showAnswers, setShowAnswers] = useState<boolean>(false); // do not show answers directly
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});

  const toggleRevealQuestion = (qId: string) => {
    setRevealedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleRevealAll = () => {
    setShowAnswers(prev => {
      const next = !prev;
      if (!next) {
        setRevealedQuestions({});
      }
      return next;
    });
  };

  useEffect(() => {
    if (initialParams) {
      if (initialParams.examId) setExamId(initialParams.examId);
      if (initialParams.subject) setSubject(initialParams.subject);
      if (initialParams.topic) setTopic(initialParams.topic);
      if (initialParams.difficulty) setDifficulty(initialParams.difficulty);
      if (initialParams.studyMaterialId) setStudyMaterialId(initialParams.studyMaterialId);
    }
  }, [initialParams]);

  useEffect(() => {
    if (topic && subject) {
      setPaperTitle(`${subject} – ${topic} (${difficulty} Paper)`);
    }
  }, [subject, topic, difficulty]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) {
      setErrorMsg('Subject and topic are required.');
      return;
    }
    setErrorMsg('');
    setIsGenerating(true);
    setSavedSuccess(false);
    setShowAnswers(false); // ALWAYS keep answers hidden by default
    setRevealedQuestions({}); // Reset individual revealed answers

    const finalCount = Math.min(100, Math.max(1, questionCount));

    try {
      const res = await onGenerate({
        subject,
        topic,
        difficulty,
        questionCount: finalCount,
        language,
        marksPerQuestion,
        negativeMarksPerQuestion: negativeMarks,
        studyMaterialId: studyMaterialId || undefined,
        rawText: initialParams?.rawText,
        useOnlyUploadedMaterial
      });

      if (res.questions && res.questions.length > 0) {
        setGeneratedQuestions(res.questions);
        setDisplayFormat('pdf'); // Show in PDF format first
      } else {
        setErrorMsg('No questions could be returned. Please adjust the topic or source excerpt.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndAction = async (action: 'view' | 'online' | 'print') => {
    if (!generatedQuestions.length || !examId) return;
    setIsSaving(true);

    try {
      const saved = await onSavePaper({
        examId,
        title: paperTitle || `${subject} - ${topic}`,
        subject,
        topic,
        difficulty,
        durationMinutes,
        negativeMarkingPerQuestion: negativeMarks,
        language,
        includeExplanationsInKey,
        useOnlyUploadedMaterial,
        questions: generatedQuestions
      });

      setSavedSuccess(true);

      if (action === 'online') {
        onNavigate('online-test', { paperId: saved.id, mode: 'online' });
      } else if (action === 'print') {
        onNavigate('papers', { paperId: saved.id, printImmediate: true });
      } else {
        onNavigate('papers', { paperId: saved.id });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save paper.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDirectPrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span>AI MCQ Question Paper Generator</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate up to 100 MCQs in PDF format. Correct answers and explanations are protected by default.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Controls (4 cols) */}
        <div className="no-print lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm self-start">
          <form onSubmit={handleGenerate} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Exam *
              </label>
              <select
                value={examId}
                onChange={(e) => {
                  setExamId(e.target.value);
                  const ex = exams.find(x => x.id === e.target.value);
                  if (ex?.subjects[0]) {
                    setSubject(ex.subjects[0].name);
                    setTopic(ex.subjects[0].topics[0]?.name || 'General');
                  }
                }}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.category})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Networks"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Congestion Control"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Number of MCQs - Support 100 questions */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Number of MCQs
                </label>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {questionCount} Questions Selected
                </span>
              </div>
              <select
                value={questionCount}
                onChange={(e) => {
                  const c = parseInt(e.target.value, 10);
                  setQuestionCount(c);
                  setCustomQuestionCount(c);
                  setDurationMinutes(c === 100 ? 150 : Math.max(10, Math.round(c * 1.5)));
                }}
                className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
              >
                <option value={5}>5 Questions (Speed Test)</option>
                <option value={10}>10 Questions (Standard Quiz)</option>
                <option value={20}>20 Questions (Chapter Review)</option>
                <option value={25}>25 Questions (Sectional Mock)</option>
                <option value={50}>50 Questions (Half Mock Paper)</option>
                <option value={100}>🔥 100 Questions (Complete 100-Question Exam Paper)</option>
              </select>

              {/* Fast presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setQuestionCount(num);
                      setDurationMinutes(num === 100 ? 150 : Math.max(15, Math.round(num * 1.5)));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      questionCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    {num === 100 ? '🔥 100 MCQs (Full Mock)' : `${num} MCQs`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom count slider or input */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-500">
                <span>Custom Question Target:</span>
                <span className="font-bold text-indigo-600">{questionCount} MCQs</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={questionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuestionCount(val);
                  setDurationMinutes(val === 100 ? 150 : Math.max(10, Math.round(val * 1.5)));
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5 Min</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span className="font-bold text-indigo-600">100 Full Exam</span>
              </div>
            </div>

            {/* Difficulty & Language */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                >
                  <option value="Easy">Easy (Factual)</option>
                  <option value="Medium">Medium (Application)</option>
                  <option value="Hard">Hard (Multi-step)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                </select>
              </div>
            </div>

            {/* Marks & Negative Marking */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Marks per Q
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(parseFloat(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Negative Mark
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(parseFloat(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Study Material */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Source Document (Optional)
              </label>
              <select
                value={studyMaterialId}
                onChange={(e) => setStudyMaterialId(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              >
                <option value="">Standard Academic Curriculum Knowledge</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>📄 {m.title}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing {questionCount} MCQs via AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Question Paper ({questionCount} MCQs)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Questions Inspection & Save Panel (8 cols) */}
        <div className="lg:col-span-8">
          {generatedQuestions.length > 0 ? (
            <div className="space-y-4">
              {/* Top Controls Bar: View Format Switcher & Answer Protection Button */}
              <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Format Toggle */}
                <div className="flex items-center space-x-2">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setDisplayFormat('pdf')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        displayFormat === 'pdf'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Printable PDF Format (A4)</span>
                    </button>
                    <button
                      onClick={() => setDisplayFormat('card')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        displayFormat === 'card'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>Card List View</span>
                    </button>
                  </div>
                </div>

                {/* CRITICAL BUTTON: SEE ANSWERS (Do not show directly) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAnswers(prev => !prev)}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      showAnswers
                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    {showAnswers ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Answers (Test Mode)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Click to See Answers & Explanations</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDirectPrintPDF}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Download / Print PDF</span>
                  </button>

                  <button
                    onClick={() => handleSaveAndAction('view')}
                    disabled={isSaving}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{savedSuccess ? 'Saved ✓' : 'Save Paper'}</span>
                  </button>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="no-print p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {showAnswers
                      ? 'Answers and explanatory solutions are currently REVEALED.'
                      : 'Answers are strictly hidden so you can practice without seeing solutions. Click "Click to See Answers" above when ready.'}
                  </span>
                </span>
                <span className="font-mono font-bold text-[11px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  {generatedQuestions.length} Questions
                </span>
              </div>

              {/* FORMAT 1: PRINTABLE PDF FORMAT (A4) - FIRST AND DEFAULT VIEW */}
              {displayFormat === 'pdf' ? (
                <div className="print-container bg-white text-black p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl mx-auto font-serif">
                  {/* Official Header */}
                  <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                      {activeExam?.name || 'PrepPilot Standard Examination'}
                    </h1>
                    <h2 className="text-base font-bold mt-1">
                      {paperTitle}
                    </h2>
                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-xs mt-2 font-sans font-medium">
                      <span>Subject: <strong>{subject}</strong></span>
                      <span>Topic: <strong>{topic}</strong></span>
                      <span>Difficulty: <strong>{difficulty}</strong></span>
                      <span>Date: <strong>{new Date().toLocaleDateString()}</strong></span>
                    </div>
                    <div className="flex justify-between text-xs mt-3 font-sans font-bold pt-2 border-t border-slate-300">
                      <span>Total Questions: {generatedQuestions.length}</span>
                      <span>Time Allowed: {durationMinutes} Minutes</span>
                      <span>Maximum Marks: {generatedQuestions.length * marksPerQuestion}</span>
                    </div>
                  </div>

                  {/* Student Details Fields */}
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

                  {/* Instructions */}
                  <div className="text-xs font-sans mb-6 bg-slate-50 p-3 border border-slate-200">
                    <span className="font-bold uppercase tracking-wider block mb-1">
                      Instructions for Candidates:
                    </span>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                      <li>This examination paper contains {generatedQuestions.length} multiple choice questions carrying a total of {generatedQuestions.length * marksPerQuestion} marks.</li>
                      <li>Each question carries {marksPerQuestion} marks.</li>
                      {negativeMarks > 0 && (
                        <li>Negative marking of {negativeMarks} marks will be deducted for each incorrect response.</li>
                      )}
                      <li>Unattempted questions receive zero marks. Darken or mark exactly one option.</li>
                    </ol>
                  </div>

                  {/* Questions in Clean A4 Format (NO ANSWERS SHOWN DIRECTLY) */}
                  <div className="space-y-6">
                    {generatedQuestions.map((q, idx) => {
                      const isRevealed = revealedQuestions[q.id] || showAnswers;
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

                          {/* Interactive Button to See Answer for this question */}
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
                              {isRevealed ? 'Solution visible below' : 'Answer protected by default'}
                            </span>
                          </div>

                          {/* Revealed Answer & Explanation Block */}
                          {isRevealed && (
                            <div className="no-print mt-2 ml-4 p-3 rounded-xl bg-purple-50/90 border border-purple-200 font-sans text-xs text-purple-950 space-y-1">
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

                          <div className="border-b border-dotted border-slate-300 pt-3 pb-1" />
                        </div>
                      );
                    })}
                  </div>

                  {/* ANSWER KEY SECTION (ONLY DISPLAYED IF USER EXPLICITLY CLICKS REVEAL ALL) */}
                  {showAnswers && (
                    <div className="mt-10 pt-8 border-t-2 border-black page-break-before">
                      <div className="text-center border-b-2 border-black pb-3 mb-4">
                        <h3 className="text-lg font-black uppercase tracking-wider">
                          Official Answer Key & Scoring Guide
                        </h3>
                        <p className="text-xs font-sans font-medium text-slate-600">
                          {paperTitle} • Negative Marking: -{negativeMarks} marks
                        </p>
                      </div>

                      {/* Quick Answer Key Grid */}
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6 font-sans text-center">
                        {generatedQuestions.map((q, i) => (
                          <div key={q.id} className="border border-black p-1 text-xs">
                            <span className="block font-bold text-slate-500 text-[10px]">Q{i + 1}</span>
                            <span className="block font-black text-sm text-indigo-700 font-mono">
                              {q.correctOption}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Detailed Explanations */}
                      <div className="space-y-3 font-sans text-xs">
                        <h4 className="font-bold uppercase text-slate-700 tracking-wider">
                          Detailed Explanations:
                        </h4>
                        {generatedQuestions.map((q, i) => (
                          <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="font-bold">
                              Q{i + 1}. Correct Option ({q.correctOption}) – {q.options[q.correctOption]}
                            </span>
                            <p className="mt-1 text-slate-700 leading-relaxed">
                              {q.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Footer with Creator Copyright Signature */}
                  <div className="mt-12 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[10px] font-sans text-slate-500 gap-1">
                    <span>PrepPilot AI Examination Suite • Generated on {new Date().toLocaleDateString()}</span>
                    <span className="font-bold text-slate-700">© Copyright: atharvacybercafe • All Rights Reserved</span>
                  </div>
                </div>
              ) : (
                /* FORMAT 2: CARD LIST VIEW */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {paperTitle}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {generatedQuestions.length} Questions • {generatedQuestions.length * marksPerQuestion} Marks
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
                    {generatedQuestions.map((q, idx) => {
                      const isRevealed = revealedQuestions[q.id] || showAnswers;
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 dark:text-white leading-relaxed">
                              {idx + 1}. {q.questionText}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                              {q.marks} Marks
                            </span>
                          </div>

                          {/* 4 Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                              const isCorrect = isRevealed && q.correctOption === optKey;
                              return (
                                <div
                                  key={optKey}
                                  className={`p-2.5 rounded-xl border flex items-start space-x-2 transition-colors ${
                                    isCorrect
                                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className="font-bold shrink-0">{optKey}.</span>
                                  <span className="leading-snug">{q.options[optKey]}</span>
                                  {isCorrect && (
                                    <span className="ml-auto text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                      ✓ Correct
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Solution & Explanation with See Answer toggle */}
                          {isRevealed ? (
                            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-950 dark:text-purple-200 text-[11px] leading-relaxed space-y-1">
                              <div className="flex justify-between items-center">
                                <strong>Official Answer: Option ({q.correctOption})</strong>
                                <button
                                  type="button"
                                  onClick={() => toggleRevealQuestion(q.id)}
                                  className="text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:underline"
                                >
                                  Hide Answer
                                </button>
                              </div>
                              <p className="mt-0.5 text-slate-700 dark:text-slate-300">{q.explanation}</p>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center pt-1">
                              <button
                                type="button"
                                onClick={() => toggleRevealQuestion(q.id)}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Click to see answer for this question</span>
                              </button>
                              <span className="text-[10px] text-slate-400">Answers protected</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
              <Sparkles className="w-12 h-12 text-indigo-400 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                Question Generator Configured
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Choose your question count (up to 100 questions) and subject on the left. The generated test will be presented in official printable PDF format first, with answers protected until you click "See Answers".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
