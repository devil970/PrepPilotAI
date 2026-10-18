import React from 'react';
import {
  Compass,
  Clock,
  Play,
  Square,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  BookOpen,
  Award,
  UserPlus
} from 'lucide-react';
import { Exam, User } from '../types';

interface NavbarProps {
  user: User | null;
  exams: Exam[];
  selectedExamId: string | null;
  onSelectExam: (id: string | null) => void;
  activeTimerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onOpenTimerModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigate: (view: string, extra?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  exams,
  selectedExamId,
  onSelectExam,
  activeTimerSeconds,
  isTimerRunning,
  onToggleTimer,
  onOpenTimerModal,
  theme,
  onToggleTheme,
  onNavigate
}) => {
  const selectedExam = exams.find(e => e.id === selectedExamId);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remMins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
    return `${remMins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2.5 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  PrepPilot
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Smart Exam Preparation & Scheduler
              </p>
            </div>
          </button>

          {/* Exam Context Switcher */}
          <div className="hidden md:flex items-center pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="relative">
              <select
                value={selectedExamId || ''}
                onChange={(e) => onSelectExam(e.target.value || null)}
                className="appearance-none bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[240px] truncate"
              >
                <option value="">All Exams (Aggregated Overview)</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    🎯 {ex.name}
                  </option>
                ))}
              </select>
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {selectedExam && (
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center space-x-1">
                <span>{selectedExam.category}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Active Study Timer Pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full pl-2 pr-1 py-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={onOpenTimerModal}
              className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 mr-2"
              title="Click to view study session tracker"
            >
              <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <span>{formatTimer(activeTimerSeconds)}</span>
              {isTimerRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>
            <button
              onClick={onToggleTimer}
              className={`p-1.5 rounded-full text-white transition-all shadow-sm ${
                isTimerRunning
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              title={isTimerRunning ? 'Stop study timer' : 'Start active study timer'}
            >
              {isTimerRunning ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
            </button>
          </div>

          {/* Quick AI Test button */}
          <button
            onClick={() => onNavigate('generator')}
            className="hidden lg:flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate MCQ Paper</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Register / Sign In Quick Action */}
          <button
            onClick={() => onNavigate('auth', { mode: 'register' })}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-2xs"
            title="Register a new student account"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Register / Sign In</span>
          </button>

          {/* User Avatar */}
          <div
            onClick={() => onNavigate('auth', { mode: 'register' })}
            className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            title="View Account & Registration"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {user ? user.name : 'Student'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {user ? user.role : 'Student'} • Goal: {user?.preferences?.targetScore || 85}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
