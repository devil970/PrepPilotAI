import { Exam, ScheduleTask } from './db.js';

export interface SchedulerOptions {
  exam: Exam;
  startDate?: string; // YYYY-MM-DD
  dailyHours?: number;
  startTime?: string; // e.g. "18:00"
  availableDays?: string[]; // e.g. ["Monday", "Tuesday", ...]
  weakTopics?: string[];
  revisionFrequencyDays?: number;
}

export function generateSmartSchedule(options: SchedulerOptions): ScheduleTask[] {
  const {
    exam,
    startDate = new Date().toISOString().split('T')[0],
    dailyHours = exam.dailyAvailableHours || 3,
    startTime = '18:00',
    availableDays = exam.preferredStudyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weakTopics = [],
    revisionFrequencyDays = 4
  } = options;

  const start = new Date(startDate);
  const examDate = new Date(exam.examDate);

  // Calculate days remaining
  const diffMs = examDate.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // Collect all topics
  interface TopicQueueItem {
    subject: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    isWeak: boolean;
    isCompleted: boolean;
  }

  const topicQueue: TopicQueueItem[] = [];
  for (const subj of exam.subjects) {
    for (const top of subj.topics) {
      const isWeak = weakTopics.includes(top.name) || (top.accuracyRate !== undefined && top.accuracyRate < 60);
      topicQueue.push({
        subject: subj.name,
        topic: top.name,
        difficulty: top.difficulty,
        isWeak,
        isCompleted: top.isCompleted
      });
    }
  }

  // Prioritize unfinished and weak topics
  topicQueue.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    if (a.isWeak !== b.isWeak) return a.isWeak ? -1 : 1;
    const diffWeight = { Hard: 3, Medium: 2, Easy: 1 };
    return diffWeight[b.difficulty] - diffWeight[a.difficulty];
  });

  const generatedTasks: ScheduleTask[] = [];
  const scheduleId = `sch_${exam.id}_${Date.now()}`;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let topicIndex = 0;
  const daysBeforeExamForFinalRevision = Math.min(5, Math.max(2, Math.floor(totalDays * 0.15)));

  for (let dayOffset = 0; dayOffset <= totalDays; dayOffset++) {
    const currentDay = new Date(start.getTime() + dayOffset * 86400000);
    const dateStr = currentDay.toISOString().split('T')[0];
    const dayName = dayNames[currentDay.getDay()];

    // Check if user studies on this day
    if (!availableDays.includes(dayName)) {
      continue;
    }

    const daysUntilExam = totalDays - dayOffset;
    const isFinalRevisionPeriod = daysUntilExam <= daysBeforeExamForFinalRevision;

    // Parse start time
    const [startHourStr, startMinStr] = startTime.split(':');
    let currentHour = parseInt(startHourStr || '18', 10);
    let currentMin = parseInt(startMinStr || '0', 10);

    const helperAddMinutes = (mins: number) => {
      const total = currentHour * 60 + currentMin + mins;
      currentHour = Math.floor(total / 60) % 24;
      currentMin = total % 60;
    };

    const helperFormatTime = (h: number, m: number) => {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const totalMinutesAvailable = Math.round(dailyHours * 60);

    if (isFinalRevisionPeriod) {
      // Final Revision & Mock Exams
      const isMockDay = dayOffset % 2 === 0;
      const slot1Mins = Math.floor(totalMinutesAvailable * 0.6);
      const slot2Mins = totalMinutesAvailable - slot1Mins - 15;

      const t1Start = helperFormatTime(currentHour, currentMin);
      helperAddMinutes(slot1Mins);
      const t1End = helperFormatTime(currentHour, currentMin);

      generatedTasks.push({
        id: `tsk_${dateStr}_1_${Math.random().toString(36).substring(2, 7)}`,
        scheduleId,
        examId: exam.id,
        date: dateStr,
        startTime: t1Start,
        endTime: t1End,
        durationMinutes: slot1Mins,
        subject: exam.subjects[dayOffset % exam.subjects.length]?.name || 'All Subjects',
        topic: isMockDay ? 'Full Syllabus Mock Examination' : 'High-Yield Formula & Concept Review',
        priority: 'High',
        difficulty: isMockDay ? 'Hard' : 'Medium',
        taskType: isMockDay ? 'Mock Test' : 'Revision',
        status: 'Pending',
        actualMinutesSpent: 0,
        notes: isMockDay ? 'Simulate exact exam conditions with countdown timer.' : 'Review summary notes and formula sheets.'
      });

      // Break
      helperAddMinutes(15);

      if (slot2Mins >= 45) {
        const t2Start = helperFormatTime(currentHour, currentMin);
        helperAddMinutes(slot2Mins);
        const t2End = helperFormatTime(currentHour, currentMin);

        generatedTasks.push({
          id: `tsk_${dateStr}_2_${Math.random().toString(36).substring(2, 7)}`,
          scheduleId,
          examId: exam.id,
          date: dateStr,
          startTime: t2Start,
          endTime: t2End,
          durationMinutes: slot2Mins,
          subject: exam.subjects[(dayOffset + 1) % exam.subjects.length]?.name || 'All Subjects',
          topic: isMockDay ? 'Mock Analysis & Error Verification' : 'Speed Practice & Previous Year Questions',
          priority: 'High',
          difficulty: 'Medium',
          taskType: isMockDay ? 'Revision' : 'Practice',
          status: 'Pending',
          actualMinutesSpent: 0
        });
      }
    } else {
      // Normal Study Day: Session 1 (Learning) + Break + Session 2 (Practice or Revision)
      const isRevisionDay = dayOffset > 0 && dayOffset % revisionFrequencyDays === 0;

      const session1Mins = Math.min(90, Math.floor(totalMinutesAvailable * 0.55));
      const session2Mins = Math.max(45, totalMinutesAvailable - session1Mins - 15);

      // Session 1
      const activeTopic = topicQueue[topicIndex % topicQueue.length] || {
        subject: exam.subjects[0]?.name || 'Core Subject',
        topic: 'Fundamental Concepts',
        difficulty: 'Medium',
        isWeak: false
      };
      topicIndex++;

      const s1Start = helperFormatTime(currentHour, currentMin);
      helperAddMinutes(session1Mins);
      const s1End = helperFormatTime(currentHour, currentMin);

      generatedTasks.push({
        id: `tsk_${dateStr}_1_${Math.random().toString(36).substring(2, 7)}`,
        scheduleId,
        examId: exam.id,
        date: dateStr,
        startTime: s1Start,
        endTime: s1End,
        durationMinutes: session1Mins,
        subject: activeTopic.subject,
        topic: activeTopic.topic,
        priority: activeTopic.isWeak ? 'High' : 'Medium',
        difficulty: activeTopic.difficulty,
        taskType: isRevisionDay ? 'Revision' : 'Learning',
        status: 'Pending',
        actualMinutesSpent: 0,
        notes: activeTopic.isWeak ? 'Weak area flagged! Focus deeply on concepts.' : undefined
      });

      // 15 min break
      helperAddMinutes(15);

      // Session 2
      const s2Start = helperFormatTime(currentHour, currentMin);
      helperAddMinutes(session2Mins);
      const s2End = helperFormatTime(currentHour, currentMin);

      const taskType2 = isRevisionDay ? 'Mock Test' : 'Practice';
      generatedTasks.push({
        id: `tsk_${dateStr}_2_${Math.random().toString(36).substring(2, 7)}`,
        scheduleId,
        examId: exam.id,
        date: dateStr,
        startTime: s2Start,
        endTime: s2End,
        durationMinutes: session2Mins,
        subject: activeTopic.subject,
        topic: `${activeTopic.topic} - MCQ Problem Set`,
        priority: 'Medium',
        difficulty: activeTopic.difficulty,
        taskType: taskType2,
        status: 'Pending',
        actualMinutesSpent: 0
      });
    }
  }

  return generatedTasks;
}
