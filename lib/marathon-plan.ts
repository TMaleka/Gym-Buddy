import { DayOfWeek } from './types';

export interface MarathonRun {
  day: DayOfWeek;
  distanceKm: number;
  description: string;
}

export interface MarathonWeek {
  weekNumber: number;
  weekStart: string; // yyyy-MM-dd (Monday)
  phase: string;
  targetKm: number;
  targetRuns: number;
  runs: MarathonRun[];
  focus: string[];
}

// Marathon date: Saturday, October 24, 2026
// Plan starts Monday, May 18, 2026
export const MARATHON_DATE = '2026-10-24';
export const PLAN_START = '2026-05-18';

function weekStartDate(weekNumber: number): string {
  const start = new Date(PLAN_START + 'T12:00:00');
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, '0');
  const d = String(start.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const MARATHON_PLAN: MarathonWeek[] = [
  // ===== Weeks 1–6: Base Building (6km x3 + 10km long run = 28km/week) =====
  ...[1, 2, 3, 4, 5, 6].map((n) => ({
    weekNumber: n,
    weekStart: weekStartDate(n),
    phase: 'Base Building',
    targetKm: 28,
    targetRuns: 4,
    runs: [
      { day: 'tuesday' as DayOfWeek, distanceKm: 6, description: '6 km easy' },
      { day: 'thursday' as DayOfWeek, distanceKm: 6, description: '6 km easy' },
      { day: 'saturday' as DayOfWeek, distanceKm: 10, description: '10 km long run' },
      { day: 'sunday' as DayOfWeek, distanceKm: 6, description: '6 km easy' },
    ],
    focus: ['Build aerobic base', 'Practice hydration', 'Test energy gels'],
  })),

  // ===== Weeks 7–10: Building Up (8km x2 + 16km Sat + 5km Sun = 37km/week) =====
  ...[7, 8, 9, 10].map((n) => ({
    weekNumber: n,
    weekStart: weekStartDate(n),
    phase: 'Building Up',
    targetKm: 37,
    targetRuns: 4,
    runs: [
      { day: 'tuesday' as DayOfWeek, distanceKm: 8, description: '8 km steady' },
      { day: 'thursday' as DayOfWeek, distanceKm: 8, description: '8 km steady' },
      { day: 'saturday' as DayOfWeek, distanceKm: 16, description: '16 km long run' },
      { day: 'sunday' as DayOfWeek, distanceKm: 5, description: '5 km recovery' },
    ],
    focus: ['Increase long run distance', 'Maintain easy pace on recovery', 'Improve pacing strategy'],
  })),

  // ===== Weeks 11–14: Marathon Build (10km x2 + 25km Sat + 5km Sun = 50km/week) =====
  ...[11, 12, 13, 14].map((n) => ({
    weekNumber: n,
    weekStart: weekStartDate(n),
    phase: 'Marathon Build',
    targetKm: 50,
    targetRuns: 4,
    runs: [
      { day: 'tuesday' as DayOfWeek, distanceKm: 10, description: '10 km steady' },
      { day: 'thursday' as DayOfWeek, distanceKm: 10, description: '10 km steady' },
      { day: 'saturday' as DayOfWeek, distanceKm: 25, description: '25 km long run' },
      { day: 'sunday' as DayOfWeek, distanceKm: 5, description: '5 km recovery' },
    ],
    focus: ['Learn marathon pacing', 'Simulate race nutrition', 'Build mental resilience'],
  })),

  // ===== Weeks 15–16: Peak Endurance (10km x3 + 30km Sat = 60km/week) =====
  ...[15, 16].map((n) => ({
    weekNumber: n,
    weekStart: weekStartDate(n),
    phase: 'Peak Endurance',
    targetKm: 60,
    targetRuns: 4,
    runs: [
      { day: 'tuesday' as DayOfWeek, distanceKm: 10, description: '10 km steady' },
      { day: 'thursday' as DayOfWeek, distanceKm: 10, description: '10 km steady' },
      { day: 'saturday' as DayOfWeek, distanceKm: 30, description: '30 km long run' },
      { day: 'sunday' as DayOfWeek, distanceKm: 10, description: '10 km easy' },
    ],
    focus: ['Simulate race conditions', 'Wear race-day gear', 'Build mental toughness'],
  })),

  // ===== Weeks 17–18: Peak + Final Big Runs (10km x3 + 35km Sat = 65km/week) =====
  ...[17, 18].map((n) => ({
    weekNumber: n,
    weekStart: weekStartDate(n),
    phase: 'Peak + Final Big Runs',
    targetKm: 65,
    targetRuns: 4,
    runs: [
      { day: 'tuesday' as DayOfWeek, distanceKm: 10, description: '10 km steady' },
      { day: 'thursday' as DayOfWeek, distanceKm: 10, description: '10 km steady' },
      { day: 'saturday' as DayOfWeek, distanceKm: 35, description: '35 km long run' },
      { day: 'sunday' as DayOfWeek, distanceKm: 10, description: '10 km easy' },
    ],
    focus: ['Final long-run confidence', 'Do not race training runs', 'Prioritize recovery and sleep'],
  })),

  // ===== Week 19: Taper =====
  {
    weekNumber: 19,
    weekStart: weekStartDate(19),
    phase: 'Taper',
    targetKm: 33,
    targetRuns: 4,
    runs: [
      { day: 'tuesday', distanceKm: 6, description: '6 km easy' },
      { day: 'thursday', distanceKm: 8, description: '8 km with light marathon pace' },
      { day: 'saturday', distanceKm: 16, description: '16 km relaxed' },
      { day: 'sunday', distanceKm: 3, description: '3 km recovery' },
    ],
    focus: ['Taper — reduce volume', 'Stay fresh for race day', 'Focus on nutrition and sleep'],
  },

  // ===== Week 20: Race Week =====
  {
    weekNumber: 20,
    weekStart: weekStartDate(20),
    phase: 'Race Week',
    targetKm: 50.2,
    targetRuns: 3,
    runs: [
      { day: 'tuesday', distanceKm: 5, description: '5 km easy' },
      { day: 'thursday', distanceKm: 3, description: '3 km shakeout' },
      { day: 'saturday', distanceKm: 42.2, description: 'MARATHON DAY — 42.2 km' },
    ],
    focus: ['Rest and hydrate', 'Mobility/stretching on Wednesday', 'Race day Saturday!'],
  },
];

export function getCurrentWeek(): MarathonWeek | null {
  const now = new Date();
  for (const week of MARATHON_PLAN) {
    const start = new Date(week.weekStart + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    if (now >= start && now < end) {
      return week;
    }
  }
  return null;
}

export function getCurrentWeekNumber(): number | null {
  const week = getCurrentWeek();
  return week ? week.weekNumber : null;
}

export function getUpcomingOrCurrentWeek(): { week: MarathonWeek; status: 'current' | 'upcoming' | 'finished' } | null {
  const current = getCurrentWeek();
  if (current) return { week: current, status: 'current' };

  const now = new Date();
  const firstStart = new Date(MARATHON_PLAN[0].weekStart + 'T00:00:00');
  if (now < firstStart) {
    return { week: MARATHON_PLAN[0], status: 'upcoming' };
  }

  const lastWeek = MARATHON_PLAN[MARATHON_PLAN.length - 1];
  const lastEnd = new Date(lastWeek.weekStart + 'T00:00:00');
  lastEnd.setDate(lastEnd.getDate() + 7);
  if (now >= lastEnd) {
    return { week: lastWeek, status: 'finished' };
  }

  return null;
}

export function getWeekByStart(weekStart: string): MarathonWeek | undefined {
  return MARATHON_PLAN.find((w) => w.weekStart === weekStart);
}
