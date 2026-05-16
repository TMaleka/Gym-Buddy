'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DayOfWeek, DAYS, WorkoutEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import WorkoutEntryModal from './WorkoutEntryModal';
import { Plus, X } from 'lucide-react';

interface WeeklyTrackerProps {
  userId: number;
  userName: string;
  workouts: WorkoutEntry[];
  onAdd: (day: DayOfWeek, workoutType: string, duration: number, distanceKm: number) => void;
  onDelete: (day: DayOfWeek) => void;
  completedDays: number;
  penalty: number;
  isWinning?: boolean;
  currentUserId: number;
}

export default function WeeklyTracker({
  userId,
  userName,
  workouts,
  onAdd,
  onDelete,
  completedDays,
  penalty,
  isWinning,
  currentUserId,
}: WeeklyTrackerProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const canEdit = userId === currentUserId;

  const dayLabels: Record<DayOfWeek, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };

  const getWorkoutForDay = (day: DayOfWeek) => {
    return workouts.find((w) => w.day_of_week === day);
  };

  const handleSaveWorkout = (workoutType: string, duration: number, distanceKm: number) => {
    if (selectedDay) {
      onAdd(selectedDay, workoutType, duration, distanceKm);
    }
  };

  return (
    <>
      <Card className={cn(
        "transition-all",
        isWinning === true && "border-green-500 border-2",
        isWinning === false && "border-red-500 border-2",
        !canEdit && "opacity-90"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{userName}</span>
            {isWinning !== undefined && (
              <span className={cn(
                "text-sm font-normal",
                isWinning ? "text-green-600" : "text-red-600"
              )}>
                {isWinning ? '🏆 Winning' : '💪 Keep Going'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => {
              const workout = getWorkoutForDay(day);
              return (
                <div key={day} className="flex flex-col items-center space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {dayLabels[day]}
                  </label>
                  {workout ? (
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-lg bg-green-100 border-2 border-green-500 flex flex-col items-center justify-center p-1 text-center">
                        <span className="text-xs font-semibold text-green-800 truncate w-full">
                          {workout.workout_type}
                        </span>
                        <span className="text-xs text-green-600">
                          {workout.duration}m{workout.distance_km ? ` ${workout.distance_km}km` : ''}
                        </span>
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => onDelete(day)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => canEdit && setSelectedDay(day)}
                      disabled={!canEdit}
                      className={cn(
                        "w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors",
                        canEdit
                          ? "border-gray-300 hover:border-primary hover:bg-primary/5 cursor-pointer"
                          : "border-gray-200 cursor-not-allowed opacity-50"
                      )}
                    >
                      {canEdit && <Plus className="h-6 w-6 text-gray-400" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-semibold">{completedDays}/5 days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Penalty:</span>
              <span className={cn(
                "font-semibold",
                penalty > 0 ? "text-red-600" : "text-green-600"
              )}>
                R{penalty}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDay && (
        <WorkoutEntryModal
          day={selectedDay}
          onSave={handleSaveWorkout}
          onClose={() => setSelectedDay(null)}
          existingType={getWorkoutForDay(selectedDay)?.workout_type}
          existingDuration={getWorkoutForDay(selectedDay)?.duration}
          existingDistance={getWorkoutForDay(selectedDay)?.distance_km}
        />
      )}
    </>
  );
}
