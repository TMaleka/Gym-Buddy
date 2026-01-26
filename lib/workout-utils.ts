import { startOfWeek, format } from 'date-fns';
import { WorkoutEntry, GOAL_WORKOUTS, PENALTY_PER_DAY } from './types';

export function getWeekStart(date: Date = new Date()): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return format(weekStart, 'yyyy-MM-dd');
}

export function calculateStats(workouts: WorkoutEntry[]) {
  const completedDays = workouts.length;
  const missedDays = Math.max(0, GOAL_WORKOUTS - completedDays);
  const penalty = missedDays * PENALTY_PER_DAY;
  
  return { completedDays, missedDays, penalty };
}

export function getNetPenalty(user1Penalty: number, user2Penalty: number): { userId: number; amount: number } {
  if (user1Penalty > user2Penalty) {
    return { userId: 1, amount: user1Penalty - user2Penalty };
  } else if (user2Penalty > user1Penalty) {
    return { userId: 2, amount: user2Penalty - user1Penalty };
  }
  return { userId: 0, amount: 0 };
}
