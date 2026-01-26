'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WeeklyTracker from '@/components/WeeklyTracker';
import { User, WorkoutEntry, DayOfWeek } from '@/lib/types';
import { calculateStats, getWeekStart } from '@/lib/workout-utils';
import { format, startOfWeek } from 'date-fns';

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart());
  const [currentUserId, setCurrentUserId] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, workoutsRes] = await Promise.all([
        fetch('/api/users'),
        fetch(`/api/workouts?weekStart=${currentWeekStart}`),
      ]);

      const usersData = await usersRes.json();
      const workoutsData = await workoutsRes.json();

      setUsers(usersData);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = async (userId: number, day: DayOfWeek, workoutType: string, duration: number) => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dayOfWeek: day,
          workoutType,
          duration,
          weekStart: currentWeekStart,
        }),
      });

      const updatedWorkouts = await response.json();
      setWorkouts((prev) => [
        ...prev.filter((w) => w.user_id !== userId),
        ...updatedWorkouts,
      ]);
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  const handleDeleteWorkout = async (userId: number, day: DayOfWeek) => {
    try {
      const response = await fetch(
        `/api/workouts?userId=${userId}&dayOfWeek=${day}&weekStart=${currentWeekStart}`,
        { method: 'DELETE' }
      );

      const updatedWorkouts = await response.json();
      setWorkouts((prev) => [
        ...prev.filter((w) => w.user_id !== userId),
        ...updatedWorkouts,
      ]);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const weekStartDate = startOfWeek(new Date(currentWeekStart), { weekStartsOn: 1 });
  const weekLabel = format(weekStartDate, 'MMM d, yyyy');

  const stats = users.map((user) => {
    const userWorkouts = workouts.filter((w) => w.user_id === user.id);
    const { completedDays, missedDays, penalty } = calculateStats(userWorkouts);
    return { user, workouts: userWorkouts, completedDays, missedDays, penalty };
  });

  const user1Stats = stats.find((s) => s.user.id === 1);
  const user2Stats = stats.find((s) => s.user.id === 2);

  const isUser1Winning = user1Stats && user2Stats ? user1Stats.penalty < user2Stats.penalty : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Week of {weekLabel}</CardTitle>
              <CardDescription>
                Complete 5 workouts this week to avoid penalties (R25 per missed day)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={currentUserId === 1 ? 'default' : 'outline'}
                onClick={() => setCurrentUserId(1)}
                size="sm"
              >
                {users.find((u) => u.id === 1)?.name || 'User 1'}
              </Button>
              <Button
                variant={currentUserId === 2 ? 'default' : 'outline'}
                onClick={() => setCurrentUserId(2)}
                size="sm"
              >
                {users.find((u) => u.id === 2)?.name || 'User 2'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <WeeklyTracker
            key={stat.user.id}
            userId={stat.user.id}
            userName={stat.user.name}
            workouts={stat.workouts}
            onAdd={(day, workoutType, duration) => handleAddWorkout(stat.user.id, day, workoutType, duration)}
            onDelete={(day) => handleDeleteWorkout(stat.user.id, day)}
            completedDays={stat.completedDays}
            penalty={stat.penalty}
            isWinning={stat.user.id === 1 ? isUser1Winning : !isUser1Winning}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {user1Stats && user2Stats && (
        <Card>
          <CardHeader>
            <CardTitle>This Week&apos;s Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user1Stats.penalty === user2Stats.penalty ? (
                <p className="text-center text-lg font-semibold">
                  🤝 Tied! Both owe R{user1Stats.penalty}
                </p>
              ) : user1Stats.penalty > user2Stats.penalty ? (
                <p className="text-center text-lg font-semibold">
                  {user1Stats.user.name} owes {user2Stats.user.name}{' '}
                  <span className="text-red-600">R{user1Stats.penalty - user2Stats.penalty}</span>
                </p>
              ) : (
                <p className="text-center text-lg font-semibold">
                  {user2Stats.user.name} owes {user1Stats.user.name}{' '}
                  <span className="text-red-600">R{user2Stats.penalty - user1Stats.penalty}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
