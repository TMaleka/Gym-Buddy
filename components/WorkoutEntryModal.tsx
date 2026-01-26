'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { WORKOUT_TYPES, WorkoutType, DayOfWeek } from '@/lib/types';

interface WorkoutEntryModalProps {
  day: DayOfWeek;
  onSave: (workoutType: WorkoutType, duration: number) => void;
  onClose: () => void;
  existingType?: WorkoutType;
  existingDuration?: number;
}

export default function WorkoutEntryModal({
  day,
  onSave,
  onClose,
  existingType,
  existingDuration,
}: WorkoutEntryModalProps) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>(existingType || 'Gym');
  const [duration, setDuration] = useState(existingDuration || 30);

  const handleSave = () => {
    if (duration > 0) {
      onSave(workoutType, duration);
      onClose();
    }
  };

  const dayLabels: Record<DayOfWeek, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Log Workout - {dayLabels[day]}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Workout Type</label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {WORKOUT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (minutes): {duration}
            </label>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5 min</span>
              <span>180 min</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
