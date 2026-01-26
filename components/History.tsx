'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, WorkoutEntry } from '@/lib/types';
import { calculateStats } from '@/lib/workout-utils';
import { format, startOfWeek } from 'date-fns';

export default function History() {
  const [users, setUsers] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, workoutsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/history'),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const weekGroups = workouts.reduce((acc, workout) => {
    if (!acc[workout.week_start]) {
      acc[workout.week_start] = [];
    }
    acc[workout.week_start].push(workout);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  const sortedWeeks = Object.keys(weekGroups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
        </CardHeader>
      </Card>

      {sortedWeeks.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No workout history yet. Start tracking!</p>
          </CardContent>
        </Card>
      ) : (
        sortedWeeks.map((weekStart) => {
          const weekWorkouts = weekGroups[weekStart];
          const weekStartDate = startOfWeek(new Date(weekStart), { weekStartsOn: 1 });
          const weekLabel = format(weekStartDate, 'MMM d, yyyy');

          const stats = users.map((user) => {
            const userWorkouts = weekWorkouts.filter((w) => w.user_id === user.id);
            const { completedDays, penalty } = calculateStats(userWorkouts);
            return { user, completedDays, penalty, workouts: userWorkouts };
          });

          const user1Stats = stats.find((s) => s.user.id === 1);
          const user2Stats = stats.find((s) => s.user.id === 2);

          return (
            <Card key={weekStart}>
              <CardHeader>
                <CardTitle className="text-lg">Week of {weekLabel}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.map((stat) => (
                    <div key={stat.user.id} className="flex justify-between items-center">
                      <span className="font-medium">{stat.user.name}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {stat.completedDays}/5 days
                        </span>
                        <span className={stat.penalty > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                          R{stat.penalty}
                        </span>
                      </div>
                    </div>
                  ))}
                  {user1Stats && user2Stats && (
                    <div className="pt-3 border-t">
                      {user1Stats.penalty === user2Stats.penalty ? (
                        <p className="text-sm text-center text-muted-foreground">
                          Tied - Both owed R{user1Stats.penalty}
                        </p>
                      ) : user1Stats.penalty > user2Stats.penalty ? (
                        <p className="text-sm text-center">
                          {user1Stats.user.name} owed {user2Stats.user.name}{' '}
                          <span className="font-semibold text-red-600">
                            R{user1Stats.penalty - user2Stats.penalty}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-center">
                          {user2Stats.user.name} owed {user1Stats.user.name}{' '}
                          <span className="font-semibold text-red-600">
                            R{user2Stats.penalty - user1Stats.penalty}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
