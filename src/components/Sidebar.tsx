import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  CalendarDays,
  LineChart,
  Bot,
  History,
  Settings,
  AlertTriangle,
  Flame,
  Award,
  UserPlus
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  overdueTasksCount?: number;
  weakTopicsCount?: number;
  streakDays?: number;
  activeExamName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  overdueTasksCount = 0,
  weakTopicsCount = 0,
  streakDays = 0,
  activeExamName
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      badge: streakDays > 0 ? (
        <span className="flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
          <span>{streakDays}d</span>
        </span>
      ) : null
    },
    {
      id: 'exams',
      label: 'My Exams',
      icon: GraduationCap,
      badge: activeExamName ? (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 truncate max-w-[80px]">
          Active
        </span>
      ) : null
    },
    {
      id: 'materials',
      label: 'Study Materials',
      icon: FileText
    },
    {
      id: 'generator',
      label: 'AI Question Generator',
      icon: Sparkles,
      highlight: true
    },
    {
      id: 'papers',
      label: 'My Question Papers',
      icon: FileSpreadsheet
    },
    {
      id: 'online-test',
      label: 'Online Tests',
      icon: CheckCircle2
    },
    {
      id: 'scheduler',
      label: 'Smart Scheduler',
      icon: CalendarDays,
      badge: overdueTasksCount > 0 ? (
        <span className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
          {overdueTasksCount}
        </span>
      ) : null
    },
    {
      id: 'analytics',
      label: 'Performance Analytics',
      icon: LineChart
    },
    {
      id: 'coach',
      label: 'AI Improvement Coach',
      icon: Bot,
      badge: weakTopicsCount > 0 ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
          {weakTopicsCount} alerts
        </span>
      ) : null
    },
    {
      id: 'history',
      label: 'Study History',
      icon: History
    },
    {
      id: 'auth',
      label: 'Register / Account',
      icon: UserPlus,
      badge: (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
          Register
        </span>
      )
    },
    {
      id: 'settings',
      label: 'Settings & Admin',
      icon: Settings
    }
  ];

  return (
    <aside className="no-print w-64 shrink-0 hidden md:block bg-slate-50/70 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 p-3 min-h-[calc(100vh-57px)]">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : item.highlight
                  ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge}
            </button>
          );
        })}
      </div>

      {/* Target encouragement card */}
      <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/50 dark:border-indigo-800/30">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-1">
          <Award className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Exam Ready Mode</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Consistent 45-min active blocks with diagnostic tests boost retention by 3.2x.
        </p>
      </div>

      {/* Creator Copyright Signature */}
      <div className="mt-6 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          © {new Date().getFullYear()} <strong className="font-bold text-slate-700 dark:text-slate-200">atharvacybercafe</strong>
        </p>
        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide mt-0.5">
          Creator Signature Verified
        </p>
      </div>
    </aside>
  );
};
