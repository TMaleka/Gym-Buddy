'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, WorkoutEntry, DayOfWeek, DAYS } from '@/lib/types';
import { MarathonWeek, MARATHON_DATE, getCurrentWeekNumber } from '@/lib/marathon-plan';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Trophy } from 'lucide-react';

interface UserWeekData {
  actualKm: number;
  actualRuns: number;
  totalWorkouts: number;
  workouts: WorkoutEntry[];
}

interface WeekProgress extends MarathonWeek {
  user1: UserWeekData;
  user2: UserWeekData;
}

type WeekStatus = 'on-track' | 'behind' | 'falling-off' | 'future' | 'completed';

function getWeekStatus(
  actualKm: number,
  targetKm: number,
  weekStart: string,
): WeekStatus {
  const now = new Date();
  const weekStartDate = new Date(weekStart + 'T00:00:00');
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 7);

  if (now < weekStartDate) return 'future';
  if (now >= weekEnd) {
    const pct = targetKm > 0 ? actualKm / targetKm : 1;
    if (pct >= 0.9) return 'completed';
    if (pct >= 0.7) return 'behind';
    return 'falling-off';
  }
  const dayOfWeek = now.getDay();
  const daysIntoWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  const expectedPct = daysIntoWeek / 7;
  const actualPct = targetKm > 0 ? actualKm / targetKm : 1;

  if (actualPct >= expectedPct * 0.8) return 'on-track';
  if (actualPct >= expectedPct * 0.5) return 'behind';
  return 'falling-off';
}

function StatusBadge({ status }: { status: WeekStatus }) {
  const labels: Record<WeekStatus, string> = {
    completed: 'Crushed It',
    'on-track': 'On Track',
    behind: 'Almost There',
    'falling-off': 'Needs a Push',
    future: 'Upcoming',
  };
  const colors: Record<WeekStatus, string> = {
    completed: 'bg-green-100 text-green-800 border-green-300',
    'on-track': 'bg-green-100 text-green-800 border-green-300',
    behind: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'falling-off': 'bg-red-100 text-red-800 border-red-300',
    future: 'bg-gray-100 text-gray-600 border-gray-300',
  };
  return (
    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full border', colors[status])}>
      {labels[status]}
    </span>
  );
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'T', friday: 'F', saturday: 'S', sunday: 'S',
};

function DayDots({ weekRuns, userWorkouts, userName }: { weekRuns: MarathonWeek['runs']; userWorkouts: WorkoutEntry[]; userName: string }) {
  const plannedDays = new Set(weekRuns.map((r) => r.day));
  return (
    <div className="flex gap-1 items-center">
      <span className="text-xs text-muted-foreground mr-1 w-8 truncate">{userName}</span>
      {DAYS.map((day) => {
        const logged = userWorkouts.find((w) => w.day_of_week === day);
        const planned = plannedDays.has(day);
        return (
          <div
            key={day}
            title={`${day}${logged ? ` — ${logged.distance_km || 0} km` : planned ? ' (planned)' : ''}`}
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
              logged
                ? 'bg-green-500 text-white'
                : planned
                  ? 'bg-gray-200 text-gray-500 border border-dashed border-gray-400'
                  : 'bg-gray-100 text-gray-300'
            )}
          >
            {logged ? (logged.distance_km || 0) : DAY_LABELS[day]}
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ actual, target, status }: { actual: number; target: number; status: WeekStatus }) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  const barColor: Record<WeekStatus, string> = {
    completed: 'bg-green-500', 'on-track': 'bg-green-500', behind: 'bg-yellow-500', 'falling-off': 'bg-red-500', future: 'bg-gray-300',
  };
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{actual} km</span>
        <span className="text-muted-foreground">/ {target} km</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={cn('h-2 rounded-full transition-all animate-fill', barColor[status])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MarathonPlan() {
  const [users, setUsers] = useState<User[]>([]);
  const [progress, setProgress] = useState<WeekProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const currentWeekNum = getCurrentWeekNumber();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, marathonRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/marathon'),
      ]);
      const usersData = await usersRes.json();
      const marathonData = await marathonRes.json();
      setUsers(usersData);
      setProgress(marathonData);
    } catch (error) {
      console.error('Error fetching marathon data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading marathon plan...</p>
      </div>
    );
  }

  const user1Name = users.find((u) => u.id === 1)?.name || 'User 1';
  const user2Name = users.find((u) => u.id === 2)?.name || 'User 2';

  const marathonDate = new Date(MARATHON_DATE + 'T00:00:00');
  const daysUntilMarathon = Math.max(
    0,
    Math.ceil((marathonDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const totalPlanKm = progress.reduce((sum, w) => sum + w.targetKm, 0);
  const user1TotalKm = progress.reduce((sum, w) => sum + w.user1.actualKm, 0);
  const user2TotalKm = progress.reduce((sum, w) => sum + w.user2.actualKm, 0);

  // Group weeks by phase
  const phases = progress.reduce((acc, week) => {
    if (!acc[week.phase]) acc[week.phase] = [];
    acc[week.phase].push(week);
    return acc;
  }, {} as Record<string, WeekProgress[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                20-Week Marathon Plan
              </CardTitle>
              <CardDescription className="mt-1">
                Marathon Day: {format(marathonDate, 'EEEE, MMMM d, yyyy')} &bull; Total plan: {Math.round(totalPlanKm)} km
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{daysUntilMarathon}</div>
              <div className="text-sm text-muted-foreground">days to go</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User totals */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: user1Name, km: user1TotalKm },
          { name: user2Name, km: user2TotalKm },
        ].map((u) => (
          <Card key={u.name}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{u.name}</span>
                <span>{Math.round(u.km * 10) / 10} / {Math.round(totalPlanKm)} km</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((u.km / totalPlanKm) * 100))}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Week-by-week grouped by phase */}
      {Object.entries(phases).map(([phase, weeks]) => (
        <div key={phase} className="space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2 pt-4">
            <Target className="h-5 w-5 text-primary" />
            {phase}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Weeks {weeks[0].weekNumber}–{weeks[weeks.length - 1].weekNumber}
            </span>
          </h2>

          {weeks[0].focus.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800 mb-1">Focus:</p>
              <ul className="text-sm text-blue-700 space-y-0.5">
                {weeks[0].focus.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          {weeks.map((week) => {
            const isCurrentWeek = currentWeekNum === week.weekNumber;
            const weekDate = new Date(week.weekStart + 'T00:00:00');
            const weekLabel = format(weekDate, 'MMM d');

            const user1Status = getWeekStatus(week.user1.actualKm, week.targetKm, week.weekStart);
            const user2Status = getWeekStatus(week.user2.actualKm, week.targetKm, week.weekStart);

            return (
              <Card
                key={week.weekNumber}
                className={cn(
                  'transition-all',
                  isCurrentWeek && 'ring-2 ring-primary shadow-lg'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">
                        Week {week.weekNumber}
                        {isCurrentWeek && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            CURRENT
                          </span>
                        )}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">{weekLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{week.targetKm} km</span>
                      <span className="text-muted-foreground">• {week.targetRuns} runs</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Planned runs */}
                  <div className="flex flex-wrap gap-2">
                    {week.runs.map((run, i) => (
                      <div key={i} className="bg-gray-50 border rounded px-2.5 py-1 text-xs">
                        <span className="font-semibold capitalize">{run.day.slice(0, 3)}</span>
                        <span className="text-muted-foreground ml-1">— {run.description}</span>
                      </div>
                    ))}
                  </div>

                  {/* User progress */}
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { name: user1Name, data: week.user1, status: user1Status },
                      { name: user2Name, data: week.user2, status: user2Status },
                    ].map((u) => (
                      <div key={u.name} className="p-3 rounded-lg bg-gray-50 border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{u.name}</span>
                          <StatusBadge status={u.status} />
                        </div>
                        <ProgressBar actual={u.data.actualKm} target={week.targetKm} status={u.status} />
                        {/* Day dots showing which days were logged */}
                        <DayDots weekRuns={week.runs} userWorkouts={u.data.workouts} userName={u.name} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
