'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, WorkoutEntry } from '@/lib/types';
import { calculateStats } from '@/lib/workout-utils';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

export default function Summary() {
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
    const key = `${workout.user_id}-${workout.week_start}`;
    if (!acc[key]) {
      acc[key] = { userId: workout.user_id, weekStart: workout.week_start, workouts: [] };
    }
    acc[key].workouts.push(workout);
    return acc;
  }, {} as Record<string, { userId: number; weekStart: string; workouts: WorkoutEntry[] }>);

  const userStats = users.map((user) => {
    const userWeeks = Object.values(weekGroups).filter((wg) => wg.userId === user.id);
    const totalPenalty = userWeeks.reduce((sum, wg) => {
      const { penalty } = calculateStats(wg.workouts);
      return sum + penalty;
    }, 0);
    const totalWorkouts = workouts.filter((w) => w.user_id === user.id).length;
    const weeksTracked = userWeeks.length;

    return { user, totalPenalty, totalWorkouts, weeksTracked };
  });

  const user1 = userStats.find((s) => s.user.id === 1);
  const user2 = userStats.find((s) => s.user.id === 2);

  const netOwed = user1 && user2 ? user1.totalPenalty - user2.totalPenalty : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Summary</CardTitle>
          <CardDescription>Total accumulated penalties and workout stats</CardDescription>
        </CardHeader>
      </Card>

      {user1 && user2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {netOwed === 0 ? (
              <p className="text-center text-2xl font-bold">
                🤝 All Even! No money owed
              </p>
            ) : netOwed > 0 ? (
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">{user1.user.name} owes {user2.user.name}</p>
                <p className="text-4xl font-bold text-red-600">R{Math.abs(netOwed)}</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">{user2.user.name} owes {user1.user.name}</p>
                <p className="text-4xl font-bold text-red-600">R{Math.abs(netOwed)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {userStats.map((stat) => {
          const isWinning = user1 && user2 ? 
            (stat.user.id === 1 ? user1.totalPenalty < user2.totalPenalty : user2.totalPenalty < user1.totalPenalty) 
            : false;

          return (
            <Card key={stat.user.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stat.user.name}</span>
                  {isWinning ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Penalties:</span>
                    <span className="font-semibold text-red-600">R{stat.totalPenalty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Workouts:</span>
                    <span className="font-semibold">{stat.totalWorkouts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weeks Tracked:</span>
                    <span className="font-semibold">{stat.weeksTracked}</span>
                  </div>
                  {stat.weeksTracked > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg per Week:</span>
                      <span className="font-semibold">
                        {(stat.totalWorkouts / stat.weeksTracked).toFixed(1)} days
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
