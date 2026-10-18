import React, { useState, useEffect } from 'react';
import {
  Settings,
  User as UserIcon,
  Shield,
  Database,
  Terminal,
  CheckCircle2,
  Save,
  Moon,
  Sun,
  Server,
  Layers,
  Key
} from 'lucide-react';
import { User } from '../../types';

interface SettingsViewProps {
  user: User | null;
  onUpdatePreferences: (prefs: Partial<User['preferences']>) => Promise<any>;
  onNavigate: (view: string, extra?: any) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  systemStats: any;
  onClearDatabase?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdatePreferences,
  onNavigate,
  theme,
  onToggleTheme,
  systemStats,
  onClearDatabase
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'admin' | 'deployment'>('profile');

  // Preferences form state
  const [targetScore, setTargetScore] = useState(user?.preferences?.targetScore || 85);
  const [dailyHours, setDailyHours] = useState(user?.preferences?.dailyAvailableHours || 3.5);
  const [language, setLanguage] = useState(user?.preferences?.preferredLanguage || 'English');
  const [startTime, setStartTime] = useState(user?.preferences?.studyStartTime || '18:00');
  const [endTime, setEndTime] = useState(user?.preferences?.studyEndTime || '21:30');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setTargetScore(user.preferences.targetScore);
      setDailyHours(user.preferences.dailyAvailableHours);
      setLanguage(user.preferences.preferredLanguage);
      setStartTime(user.preferences.studyStartTime);
      setEndTime(user.preferences.studyEndTime);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdatePreferences({
      targetScore: Number(targetScore),
      dailyAvailableHours: Number(dailyHours),
      preferredLanguage: language as any,
      studyStartTime: startTime,
      studyEndTime: endTime
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Settings & Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile, study schedule preferences, administrator controls, and local Windows XAMPP scripts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>User Profile & Study Goals</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'admin'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Admin & System Health</span>
        </button>

        <button
          onClick={() => setActiveTab('deployment')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'deployment'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Local Windows & XAMPP Setup</span>
        </button>
      </div>

      {/* TAB 1: USER PROFILE & GOALS */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm max-w-2xl space-y-6">
          <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {user?.name || 'Registered Student'}
              </h3>
              <p className="text-xs text-slate-400">
                {user?.email || 'No email registered yet'} • Role: <strong className="text-indigo-600 capitalize">{user?.role || 'student'}</strong>
              </p>
            </div>
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => onNavigate('auth', { mode: 'register' })}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100"
              >
                Register User / Switch
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Preferences saved successfully! Schedule algorithms updated.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Overall Target Score (%)
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Available Study Time (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="14"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Study Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Study End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Theme:</span>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ADMIN & SYSTEM HEALTH */}
      {activeTab === 'admin' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              System Health & Operational Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              PrepPilot AI Enterprise Suite • Normalized Database Storage
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Registered Users</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1 block">
                {systemStats?.counts?.users || 2}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Exams</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1 block">
                {systemStats?.counts?.exams || 2}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Question Papers</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1 block">
                {systemStats?.counts?.papers || 1}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Test Attempts</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1 block">
                {systemStats?.counts?.attempts || 1}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-indigo-600" />
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">Gemini 3.8 Flash AI Provider</h5>
                <p className="text-[11px] text-slate-500">
                  {systemStats?.geminiConfigured
                    ? 'Connected and active via server-side GoogleGenAI SDK'
                    : 'Curricular fallback generator active (API key can be set in Settings > Secrets)'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Online
            </span>
          </div>

          {/* Database Reset & Purge Controls */}
          <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-200 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-rose-600" />
                  <span>Database Purge & Reset Tool</span>
                </h4>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                  Remove all sample data and user records to keep the database completely pristine and empty for clean test deployments.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onClearDatabase}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center space-x-2 transition-all active:scale-95"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Remove All Sample & Database Records</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOCAL WINDOWS & XAMPP SETUP */}
      {activeTab === 'deployment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Local Windows & XAMPP MySQL Execution Package
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All scripts for running PrepPilot AI on Windows with Python & XAMPP MySQL are generated in this project workspace.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>1. One-Click Windows Launch Scripts</span>
              </h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <li>• <code>setup.bat</code>: Verifies Python 3.10+, creates venv, and installs pip requirements.</li>
                <li>• <code>run.bat</code>: Validates XAMPP MySQL port 3306, initializes schema, and launches server.</li>
                <li>• <code>stop.bat</code>: Safely terminates background Flask server instances.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>2. SQL Schema & Seed Database Files</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                The full 22-table normalized schema with primary keys, foreign keys, indexes, and test records is located in:
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <li>• <code>schema.sql</code>: Complete DDL with constraints, foreign keys, and indexes.</li>
                <li>• <code>seed.sql</code>: Realistic sample examinations, questions, and attempt records.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Server className="w-4 h-4 text-purple-600" />
                <span>3. XAMPP MySQL Quick Commands</span>
              </h4>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                <p># In XAMPP Shell or Windows CMD:</p>
                <p>mysql -u root -p &lt; schema.sql</p>
                <p>mysql -u root -p &lt; seed.sql</p>
                <p>python app.py</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
