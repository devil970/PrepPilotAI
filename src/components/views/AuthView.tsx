import React, { useState } from 'react';
import {
  Compass,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  Clock,
  Shield,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { User } from '../../types';

interface AuthViewProps {
  currentUser: User | null;
  initialMode?: 'register' | 'login';
  onLogin: (email: string, password?: string) => Promise<any>;
  onRegister: (name: string, email: string, password?: string, preferences?: any) => Promise<any>;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  currentUser,
  initialMode = 'register',
  onLogin,
  onRegister,
  onLogout,
  onNavigate
}) => {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [examCategory, setExamCategory] = useState<'Competitive' | 'College Semester' | 'Entrance' | 'Government' | 'Certification'>('Competitive');
  const [primaryExamName, setPrimaryExamName] = useState('UGC NET Computer Science');
  const [targetScore, setTargetScore] = useState(85);
  const [dailyHours, setDailyHours] = useState(3.5);
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Hindi' | 'Marathi'>('English');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [studyDays, setStudyDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]);

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (studyDays.includes(day)) {
      if (studyDays.length > 1) {
        setStudyDays(studyDays.filter(d => d !== day));
      }
    } else {
      setStudyDays([...studyDays, day]);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter both your full name and a valid email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await onRegister(
        name.trim(),
        email.trim().toLowerCase(),
        password || 'student123',
        {
          targetScore: Number(targetScore),
          dailyAvailableHours: Number(dailyHours),
          preferredLanguage,
          preferredStudyDays: studyDays,
          studyStartTime: '18:00',
          studyEndTime: '21:30',
          role
        }
      );

      setSuccessMsg(`Welcome to PrepPilot AI, ${name}! Your student profile and schedule are ready.`);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await onLogin(email.trim().toLowerCase(), password || 'student123');
      setSuccessMsg('Signed in successfully! Loading your personal study dashboard...');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (demoEmail: string, demoName: string, demoRole: 'student' | 'admin') => {
    setEmail(demoEmail);
    setPassword('demo123');
    setName(demoName);
    setRole(demoRole);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner if already logged in */}
      {currentUser && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Currently logged in as <span className="text-indigo-600">{currentUser.name}</span> ({currentUser.email})
              </p>
              <p className="text-[11px] text-slate-500">
                Role: <span className="capitalize font-semibold">{currentUser.role}</span> • Goal: {currentUser.preferences.targetScore}%
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Go to Dashboard
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Branding / Features Hero Column (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Compass className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">
                  PrepPilot <span className="text-cyan-300">AI</span>
                </span>
                <p className="text-[11px] text-indigo-200 font-medium">
                  Smart Exam Preparation & Scheduler
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight leading-snug">
              {mode === 'register' ? 'Join Thousands of Serious Aspirants.' : 'Welcome Back to Your Exam Flight Deck.'}
            </h2>
            <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
              Automate your syllabus planning, generate verified 100-question mock papers, and fix weak concepts with precision AI mentoring.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start space-x-3 text-xs">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-300" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">Algorithmic Day-by-Day Scheduler</strong>
                  <span className="text-[11px] text-indigo-200">Allocates revisions, mock tests, and weak topics until exam day.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">100-Question MCQ Generator (PDF Ready)</strong>
                  <span className="text-[11px] text-indigo-200">Clean printable A4 papers with answers protected by default.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-cyan-300" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">Performance Coach & Diagnostic Reports</strong>
                  <span className="text-[11px] text-indigo-200">Prescribes exact focus minutes based on real test mistakes.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-indigo-300 flex items-center justify-between">
            <span>Enterprise Grade • Secure Sessions</span>
            <span>100% Free for Students</span>
          </div>
        </div>

        {/* Right Form Column (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Student Account (Register)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Existing Account</span>
            </button>
          </div>

          {/* Alert feedback */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Fresh Database Registration Status Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {mode === 'register' ? 'Register New Student Profile' : 'Student & Admin Sign In'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Clean database initialized with zero sample data. Create your personalized profile below.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
              Clean DB Ready
            </span>
          </div>

          {/* REGISTRATION FORM */}
          {mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@example.com"
                    className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 pr-10 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Study Goals Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] block mb-2">
                  Examination Goals & Study Preferences
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Exam Category
                    </label>
                    <select
                      value={examCategory}
                      onChange={(e) => setExamCategory(e.target.value as any)}
                      className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    >
                      <option value="Competitive">Competitive (NET, GATE, UPSC, Banking)</option>
                      <option value="College Semester">College Semester Final Exams</option>
                      <option value="Entrance">Entrance Exam (JEE, NEET, CAT)</option>
                      <option value="Government">Government Recruitment</option>
                      <option value="Certification">Professional Certification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value as any)}
                      className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Score Goal (%)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="100"
                      value={targetScore}
                      onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                      className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Daily Available Study Time (Hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="14"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                      className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Available Study Days of Week
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {daysList.map(d => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          studyDays.includes(d)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Role Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Account Type:</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                      role === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    Student Aspirant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                      role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2 mt-4"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Complete Registration & Launch Scheduler</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN IN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. atharvadhawane789@gmail.com"
                  className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 pr-10 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2 mt-6"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to PrepPilot AI</span>
                  </>
                )}
              </button>

              <div className="text-center pt-4">
                <span className="text-slate-400">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Register as New Student
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
