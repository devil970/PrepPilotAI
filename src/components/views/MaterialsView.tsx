import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  Trash2,
  CheckCircle2,
  FileCheck,
  Search,
  Scan,
  Layers,
  ArrowRight,
  Calculator,
  Key
} from 'lucide-react';
import { StudyMaterial, Exam } from '../../types';

interface MaterialsViewProps {
  materials: StudyMaterial[];
  exams: Exam[];
  selectedExamId: string | null;
  onUploadText: (data: {
    title: string;
    text: string;
    fileName?: string;
    examId: string;
    subjectId?: string;
    isOcrApplied?: boolean;
  }) => Promise<any>;
  onDeleteMaterial: (id: string) => Promise<any>;
  onNavigate: (view: string, extra?: any) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  exams,
  selectedExamId,
  onUploadText,
  onDeleteMaterial,
  onNavigate
}) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(materials[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');

  // Paste / Upload Form State
  const [docTitle, setDocTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [targetExamId, setTargetExamId] = useState(selectedExamId || exams[0]?.id || '');
  const [simulateOcr, setSimulateOcr] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setSimulateOcr(true);
    }

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPastedText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !pastedText.trim() || !targetExamId) {
      setErrorMsg('Please provide a document title, exam selection, and text content.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const created = await onUploadText({
        title: docTitle.trim(),
        text: pastedText.trim(),
        fileName: `${docTitle.trim()}.pdf`,
        examId: targetExamId,
        isOcrApplied: simulateOcr
      });

      if (created?.id) {
        setSelectedMaterialId(created.id);
      }
      setDocTitle('');
      setPastedText('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please check document content.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFromChapter = (chapterTitle: string, keyPoints: string[]) => {
    onNavigate('generator', {
      examId: activeMaterial.examId,
      studyMaterialId: activeMaterial.id,
      topic: chapterTitle,
      rawText: `${chapterTitle}\n${keyPoints.join('\n')}\n${activeMaterial.extractedText.slice(0, 3000)}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>AI Study Material & Document Analyzer</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload PDFs, notes, or pasted syllabus chapters. AI extracts formulas, key definitions, and generates targeted questions.
          </p>
        </div>
      </div>

      {/* Main Grid: Upload/Paste Panel + Analysis Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Material List (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload New Study Material</span>
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'paste'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Paste Notes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'upload'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  File Upload
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Exam
                </label>
                <select
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document / Chapter Title
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Operating System Deadlocks & Memory Notes"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                />
              </div>

              {activeTab === 'upload' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select File (PDF, DOCX, TXT)
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Click to choose or drop document
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PDF, Word, or plain text notes with OCR detection
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : null}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Extracted Document Text / Notes Content
                </label>
                <textarea
                  rows={5}
                  required
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste textbook excerpt, lecture notes, or key topic points..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-800 dark:text-slate-200 leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ocrToggle"
                  checked={simulateOcr}
                  onChange={(e) => setSimulateOcr(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="ocrToggle" className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                  <Scan className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Scanned PDF (Apply Tesseract OCR & Layout Preservation)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Document Sections...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze & Extract Concepts</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Library of Analyzed Documents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Analyzed Documents ({materials.length})
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {materials.map((mat) => {
                const isSelected = activeMaterial?.id === mat.id;
                return (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {mat.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {mat.pageCount} pages • {mat.analysis?.chapters.length || 0} chapters •{' '}
                        {mat.isOcrApplied ? 'OCR Applied' : 'Native Text'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete material "${mat.title}"?`)) onDeleteMaterial(mat.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: In-depth Analysis & Chapter Question Triggers (7 cols) */}
        <div className="lg:col-span-7">
          {activeMaterial ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    <FileCheck className="w-4 h-4" />
                    <span>AI Knowledge Extraction Verified</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {activeMaterial.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    File: {activeMaterial.fileName} • {activeMaterial.pageCount} pages • Uploaded {new Date(activeMaterial.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() =>
                    onNavigate('generator', {
                      examId: activeMaterial.examId,
                      studyMaterialId: activeMaterial.id,
                      topic: activeMaterial.title
                    })
                  }
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Full Paper From Notes</span>
                </button>
              </div>

              {/* Chapter-wise Breakdown */}
              {activeMaterial.analysis?.chapters && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Structured Chapters & Concepts</span>
                  </h4>

                  <div className="space-y-4">
                    {activeMaterial.analysis.chapters.map((ch) => (
                      <div
                        key={ch.chapterNumber}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[11px]">
                              {ch.chapterNumber}
                            </span>
                            <span>{ch.title}</span>
                          </span>

                          <button
                            onClick={() => handleGenerateFromChapter(ch.title, ch.keyConcepts)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span>Generate MCQs from Chapter</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                          "{ch.summary}"
                        </p>

                        {/* Key Concepts */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Key Concepts:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ch.keyConcepts.map((kc, kidx) => (
                              <span
                                key={kidx}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              >
                                • {kc}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Formulas */}
                        {ch.formulas && ch.formulas.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 mb-1">
                              <Calculator className="w-3.5 h-3.5" />
                              <span>Key Formulas & Numerical Recurrences:</span>
                            </span>
                            <div className="space-y-1">
                              {ch.formulas.map((f, fidx) => (
                                <code
                                  key={fidx}
                                  className="block text-[11px] font-mono bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg text-slate-800 dark:text-slate-200"
                                >
                                  {f}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Definitions & Topics for Exam */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {activeMaterial.analysis?.importantDefinitions && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                    <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1 mb-2">
                      <Key className="w-3.5 h-3.5" />
                      <span>Important Definitions</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {activeMaterial.analysis.importantDefinitions.map((d, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeMaterial.analysis?.suggestedTopics && (
                  <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-900/40">
                    <h5 className="text-xs font-bold text-cyan-900 dark:text-cyan-300 flex items-center space-x-1 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Suggested High-Yield MCQ Topics</span>
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {activeMaterial.analysis.suggestedTopics.map((top, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            onNavigate('generator', {
                              examId: activeMaterial.examId,
                              studyMaterialId: activeMaterial.id,
                              topic: top
                            })
                          }
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 hover:bg-cyan-100"
                        >
                          {top} ⚡
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Raw Excerpt Viewer */}
              <div className="pt-2">
                <details className="text-xs text-slate-500">
                  <summary className="font-bold cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                    Preview Raw Extracted Text ({activeMaterial.extractedText.length} characters)
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl max-h-48 overflow-y-auto text-[11px] font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {activeMaterial.extractedText}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Study Material Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Paste lecture notes or upload a PDF syllabus chapter to view structured concept breakdowns.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
