import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  Trash2,
  Calendar,
  Filter,
  Play,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { ScheduleTask, Exam } from '../../types';

interface SchedulerViewProps {
  tasks: ScheduleTask[];
  exams: Exam[];
  selectedExamId: string | null;
  onUpdateTask: (id: string, updates: Partial<ScheduleTask>) => Promise<any>;
  onCreateTask: (task: Partial<ScheduleTask>) => Promise<any>;
  onDeleteTask: (id: string) => Promise<any>;
  onRegenerateSchedule: (params: any) => Promise<any>;
  onStartStudy: (examId?: string, subject?: string, topic?: string) => void;
  onNavigate: (view: string, extra?: any) => void;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  tasks,
  exams,
  selectedExamId,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  onRegenerateSchedule,
  onStartStudy,
  onNavigate
}) => {
  const [calendarView, setCalendarView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeDateOffset, setActiveDateOffset] = useState<number>(0);

  // Custom Task Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customStartTime, setCustomStartTime] = useState('18:00');
  const [customEndTime, setCustomEndTime] = useState('19:30');
  const [customDuration, setCustomDuration] = useState(90);
  const [customPriority, setCustomPriority] = useState<ScheduleTask['priority']>('Medium');
  const [customType, setCustomType] = useState<ScheduleTask['taskType']>('Learning');
  const [customExamId, setCustomExamId] = useState(selectedExamId || exams[0]?.id || '');

  // Skip Modal
  const [skippingTaskId, setSkippingTaskId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState<string>('Topic already mastered');

  // Reschedule Modal
  const [reschedulingTask, setReschedulingTask] = useState<ScheduleTask | null>(null);
  const [newDate, setNewDate] = useState<string>('');

  const activeExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const filteredTasks = tasks.filter(t => {
    if (selectedExamId && t.examId !== selectedExamId) return false;
    if (filterType !== 'all' && t.taskType !== filterType) return false;
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleRegenerate = async () => {
    if (!activeExam) return;
    if (confirm(`Regenerate future schedule for "${activeExam.name}"? Completed tasks and history will be strictly preserved.`)) {
      await onRegenerateSchedule({
        examId: activeExam.id,
        startDate: todayStr,
        dailyHours: activeExam.dailyAvailableHours,
        availableDays: activeExam.preferredStudyDays
      });
    }
  };

  const handleSaveCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubject.trim() || !customTopic.trim() || !customExamId) return;

    await onCreateTask({
      examId: customExamId,
      date: customDate,
      startTime: customStartTime,
      endTime: customEndTime,
      durationMinutes: customDuration,
      subject: customSubject,
      topic: customTopic,
      priority: customPriority,
      difficulty: 'Medium',
      taskType: customType,
      status: 'Pending',
      actualMinutesSpent: 0
    });

    setIsAddModalOpen(false);
    setCustomSubject('');
    setCustomTopic('');
  };

  const handleConfirmSkip = async () => {
    if (!skippingTaskId) return;
    await onUpdateTask(skippingTaskId, {
      status: 'Skipped',
      skipReason
    });
    setSkippingTaskId(null);
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingTask || !newDate) return;
    await onUpdateTask(reschedulingTask.id, {
      date: newDate
    });
    setReschedulingTask(null);
  };

  // Group tasks by date
  const tasksByDate: Record<string, ScheduleTask[]> = {};
  filteredTasks.forEach(t => {
    if (!tasksByDate[t.date]) tasksByDate[t.date] = [];
    tasksByDate[t.date].push(t);
  });

  // Calculate dates to display based on view
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + activeDateOffset);

  const getVisibleDates = () => {
    if (calendarView === 'daily') {
      return [baseDate.toISOString().split('T')[0]];
    }
    if (calendarView === 'weekly') {
      const dates = [];
      const currDay = baseDate.getDay();
      const firstDay = new Date(baseDate);
      firstDay.setDate(baseDate.getDate() - (currDay === 0 ? 6 : currDay - 1)); // start on Monday
      for (let i = 0; i < 7; i++) {
        const d = new Date(firstDay);
        d.setDate(firstDay.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      return dates;
    }
    // Monthly (14 days window)
    const dates = [];
    for (let i = -2; i < 12; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const visibleDates = getVisibleDates();

  const getTaskTypeBadge = (type: ScheduleTask['taskType']) => {
    switch (type) {
      case 'Learning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'Practice':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'Revision':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200';
      case 'Mock Test':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      case 'Break':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            <span>Smart Day-by-Day Study Scheduler</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Algorithmic study schedule allocating weak areas, revisions, practice blocks, and mock tests until exam day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Custom Task</span>
          </button>

          <button
            onClick={handleRegenerate}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate Remaining</span>
          </button>
        </div>
      </div>

      {/* Controls: View Switcher, Filter, & Date Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Calendar View Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start">
          <button
            onClick={() => setCalendarView('daily')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              calendarView === 'daily'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setCalendarView('weekly')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              calendarView === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setCalendarView('monthly')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              calendarView === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            14-Day Planner
          </button>
        </div>

        {/* Task Type Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Task Types</option>
            <option value="Learning">Learning Only</option>
            <option value="Practice">Practice Problems</option>
            <option value="Revision">Revision Sessions</option>
            <option value="Mock Test">Mock Examinations</option>
          </select>
        </div>

        {/* Date Offset Navigator */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveDateOffset((prev) => prev - (calendarView === 'daily' ? 1 : 7))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveDateOffset(0)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            Today
          </button>

          <button
            onClick={() => setActiveDateOffset((prev) => prev + (calendarView === 'daily' ? 1 : 7))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Columns / Day Cards */}
      <div className={`grid gap-4 ${
        calendarView === 'daily'
          ? 'grid-cols-1 max-w-2xl mx-auto'
          : calendarView === 'weekly'
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-7'
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
      }`}>
        {visibleDates.map((dateStr) => {
          const dateTasks = tasksByDate[dateStr] || [];
          const dObj = new Date(dateStr + 'T00:00:00');
          const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          return (
            <div
              key={dateStr}
              className={`rounded-2xl border flex flex-col transition-all ${
                isToday
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Date Column Header */}
              <div className={`p-3 border-b flex items-center justify-between ${
                isToday
                  ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-100/50 dark:bg-indigo-950/60'
                  : 'border-slate-100 dark:border-slate-800'
              }`}>
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                    isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                  }`}>
                    {dayName} {isToday ? '• Today' : ''}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {/* Tasks List */}
              <div className="p-2 space-y-2 flex-1 min-h-[140px]">
                {dateTasks.length > 0 ? (
                  dateTasks.map((t) => {
                    const isCompleted = t.status === 'Completed';
                    const isSkipped = t.status === 'Skipped';

                    return (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                          isCompleted
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 opacity-80'
                            : isSkipped
                            ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60 line-through'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getTaskTypeBadge(t.taskType)}`}>
                            {t.taskType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.startTime} ({t.durationMinutes}m)
                          </span>
                        </div>

                        <div>
                          <h5 className={`font-bold text-slate-900 dark:text-white truncate ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {t.topic}
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate">
                            {t.subject}
                          </p>
                        </div>

                        {/* Task Action Bar */}
                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() =>
                                onUpdateTask(t.id, {
                                  status: isCompleted ? 'Pending' : 'Completed',
                                  actualMinutesSpent: isCompleted ? 0 : t.durationMinutes
                                })
                              }
                              className={`p-1 rounded-md transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={isCompleted ? 'Mark uncompleted' : 'Mark complete'}
                            >
                              <Check className="w-3 h-3" />
                            </button>

                            {!isCompleted && !isSkipped && (
                              <button
                                onClick={() => {
                                  setSkippingTaskId(t.id);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                title="Skip task with reason"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}

                            {!isCompleted && (
                              <button
                                onClick={() => {
                                  setReschedulingTask(t);
                                  setNewDate(t.date);
                                }}
                                className="text-[10px] font-semibold text-slate-400 hover:text-indigo-600"
                                title="Reschedule date"
                              >
                                Move
                              </button>
                            )}
                          </div>

                          {!isCompleted && !isSkipped && (
                            <button
                              onClick={() => onStartStudy(t.examId, t.subject, t.topic)}
                              className="flex items-center space-x-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Focus</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-6 text-slate-400">
                    <span className="text-[10px]">Rest / Free Day</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Custom Study Task
            </h3>

            <form onSubmit={handleSaveCustomTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Associated Exam
                </label>
                <select
                  value={customExamId}
                  onChange={(e) => setCustomExamId(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topic / Chapter *
                  </label>
                  <input
                    type="text"
                    required
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Linear Algebra"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Task Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(parseInt(e.target.value, 10))}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Task Type
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                  >
                    <option value="Learning">Learning</option>
                    <option value="Practice">Practice</option>
                    <option value="Revision">Revision</option>
                    <option value="Mock Test">Mock Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={customPriority}
                    onChange={(e) => setCustomPriority(e.target.value as any)}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skip Task Dialog */}
      {skippingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Skip Study Task
            </h3>
            <p className="text-xs text-slate-500">
              Provide a reason for skipping so AI can reallocate this topic if needed:
            </p>
            <select
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
            >
              <option value="Topic already thoroughly mastered">Topic already thoroughly mastered</option>
              <option value="Lack of time / unexpected commitment">Lack of time / unexpected commitment</option>
              <option value="Will practice during mock tests">Will practice during mock tests</option>
              <option value="Syllabus updated / topic omitted">Syllabus updated / topic omitted</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSkippingTaskId(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Task Dialog */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reschedule: {reschedulingTask.topic}
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setReschedulingTask(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                Update Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
