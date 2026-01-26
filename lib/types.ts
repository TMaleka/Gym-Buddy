export interface User {
  id: number;
  name: string;
}

export interface WorkoutEntry {
  id?: number;
  user_id: number;
  week_start: string;
  day_of_week: DayOfWeek;
  workout_type: WorkoutType;
  duration: number;
}

export interface WeekStats {
  user: User;
  workouts: WorkoutEntry[];
  completedDays: number;
  missedDays: number;
  penalty: number;
}

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type DayOfWeek = typeof DAYS[number];

export const WORKOUT_TYPES = ['Run', 'Gym', 'Home Workout', 'Walk', 'CrossFit', 'Boxing', 'Calisthenics', 'Pole'] as const;
export type WorkoutType = typeof WORKOUT_TYPES[number];

export const GOAL_WORKOUTS = 5;
export const PENALTY_PER_DAY = 25;
