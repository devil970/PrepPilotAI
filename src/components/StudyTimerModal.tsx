import React, { useState } from 'react';
import { X, Play, Pause, Square, CheckCircle, Clock, Tag } from 'lucide-react';
import { Exam } from '../types';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerSeconds: number;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onSaveSession: (data: { examId?: string; subject?: string; topic?: string; durationMinutes: number; notes?: string }) => void;
  exams: Exam[];
  selectedExamId: string | null;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  timerSeconds,
  isRunning,
  onToggleRun,
  onReset,
  onSaveSession,
  exams,
  selectedExamId
}) => {
  if (!isOpen) return null;

  const [activeExamId, setActiveExamId] = useState<string>(selectedExamId || (exams[0]?.id || ''));
  const currentExam = exams.find(e => e.id === activeExamId);

  const [subject, setSubject] = useState<string>(currentExam?.subjects[0]?.name || 'General');
  const [topic, setTopic] = useState<string>(currentExam?.subjects[0]?.topics[0]?.name || 'Core Revision');
  const [notes, setNotes] = useState<string>('');

  const formatLargeTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSave = () => {
    const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));
    onSaveSession({
      examId: activeExamId,
      subject,
      topic,
      durationMinutes,
      notes
    });
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Study Tracker</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Idle-filtered study timer. Record real productive hours against syllabus tasks.
          </p>
        </div>

        {/* Stopwatch Display */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl py-6 px-4 text-center border border-slate-200 dark:border-slate-700/60 mb-6">
          <div className="text-5xl font-extrabold tracking-tight font-mono text-indigo-600 dark:text-indigo-400">
            {formatLargeTime(timerSeconds)}
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-wider">
            {isRunning ? '🟢 Active Focus Session Running' : timerSeconds > 0 ? '⏸️ Paused' : 'Ready To Study'}
          </p>
        </div>

        {/* Stopwatch Controls */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <button
            onClick={onToggleRun}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-transform active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{timerSeconds > 0 ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>

          {timerSeconds > 0 && (
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Log & Save</span>
            </button>
          )}

          {timerSeconds > 0 && !isRunning && (
            <button
              onClick={onReset}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Reset Timer"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Target Tagging */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Associated Exam
            </label>
            <select
              value={activeExamId}
              onChange={(e) => {
                setActiveExamId(e.target.value);
                const selected = exams.find(x => x.id === e.target.value);
                if (selected?.subjects[0]) {
                  setSubject(selected.subjects[0].name);
                  setTopic(selected.subjects[0].topics[0]?.name || 'Core');
                }
              }}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-100"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-100"
                placeholder="e.g. Computer Networks"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Topic / Chapter
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-100"
                placeholder="e.g. TCP Congestion"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Session Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-100"
              placeholder="What did you accomplish?"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
