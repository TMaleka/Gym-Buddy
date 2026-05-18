'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, WorkoutEntry, DayOfWeek, DAYS } from '@/lib/types';
import { getUpcomingOrCurrentWeek, MarathonWeek, MARATHON_DATE, PLAN_START } from '@/lib/marathon-plan';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Target,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Calendar,
  Plus,
  X,
} from 'lucide-react';

type ProgressStatus = 'on-track' | 'behind' | 'falling-off';

function getProgressStatus(actualKm: number, targetKm: number): ProgressStatus {
  if (targetKm === 0) return 'on-track';
  const pct = actualKm / targetKm;
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysIntoWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  const expectedPct = daysIntoWeek / 7;

  if (pct >= expectedPct * 0.8) return 'on-track';
  if (pct >= expectedPct * 0.5) return 'behind';
  return 'falling-off';
}

function StatusBanner({ status, userName }: { status: ProgressStatus; userName: string }) {
  if (status === 'on-track') {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-300 rounded-lg px-4 py-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="font-semibold text-green-800">{userName} is crushing it!</span>
      </div>
    );
  }
  if (status === 'behind') {
    return (
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <span className="font-semibold text-yellow-800">{userName}, you've got this — time to lace up!</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg px-4 py-2">
      <TrendingDown className="h-5 w-5 text-red-600" />
      <span className="font-semibold text-red-800">{userName}, let's get back on track — every km counts!</span>
    </div>
  );
}

export default function ThisWeek() {
  const [users, setUsers] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(1);
  const [logDay, setLogDay] = useState<DayOfWeek | null>(null);
  const [logKm, setLogKm] = useState('');

  const result = getUpcomingOrCurrentWeek();
  const week: MarathonWeek | null = result?.week || null;
  const weekStatus = result?.status || null; // 'current' | 'upcoming' | 'finished'
  const weekStart = week?.weekStart || PLAN_START;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, workoutsRes] = await Promise.all([
        fetch('/api/users'),
        fetch(`/api/workouts?weekStart=${weekStart}`),
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

  const handleLogRun = async (userId: number, day: DayOfWeek, distanceKm: number) => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dayOfWeek: day,
          workoutType: 'Run',
          duration: Math.round(distanceKm * 6),
          weekStart,
          distanceKm,
        }),
      });
      const updatedWorkouts = await response.json();
      setWorkouts((prev) => [
        ...prev.filter((w) => w.user_id !== userId),
        ...updatedWorkouts,
      ]);
      setLogDay(null);
      setLogKm('');
    } catch (error) {
      console.error('Error logging run:', error);
    }
  };

  const handleDeleteRun = async (userId: number, day: DayOfWeek) => {
    try {
      const response = await fetch(
        `/api/workouts?userId=${userId}&dayOfWeek=${day}&weekStart=${weekStart}`,
        { method: 'DELETE' }
      );
      const updatedWorkouts = await response.json();
      setWorkouts((prev) => [
        ...prev.filter((w) => w.user_id !== userId),
        ...updatedWorkouts,
      ]);
    } catch (error) {
      console.error('Error deleting run:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Marathon Training Plan
            </CardTitle>
            <CardDescription>
              No plan data available. Check the Full Plan tab.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const marathonDate = new Date(MARATHON_DATE + 'T00:00:00');
  const daysUntilMarathon = Math.max(
    0,
    Math.ceil((marathonDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const planStartDate = new Date(PLAN_START + 'T00:00:00');
  const daysUntilStart = Math.max(
    0,
    Math.ceil((planStartDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const weekDate = new Date(week.weekStart + 'T00:00:00');
  const weekLabel = format(weekDate, 'MMM d, yyyy');

  const dayLabels: Record<DayOfWeek, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };

  const plannedDays = new Set(week.runs.map((r) => r.day));
  const isActive = weekStatus === 'current';

  return (
    <div className="space-y-6">
      {/* Countdown banner when plan hasn't started */}
      {weekStatus === 'upcoming' && (
        <Card className="border-2 border-yellow-400 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                  Training starts {format(planStartDate, 'EEEE, MMMM d')}!
                </CardTitle>
                <CardDescription className="text-yellow-700 mt-1">
                  {daysUntilStart} days until Week 1 begins. Here&apos;s your preview of what&apos;s coming up.
                  You can already log early runs below!
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-700">{daysUntilStart}</div>
                <div className="text-sm text-yellow-600">days to go</div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Finished banner */}
      {weekStatus === 'finished' && (
        <Card className="border-2 border-green-400 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Training Plan Complete!
            </CardTitle>
            <CardDescription className="text-green-700">
              The 20-week training plan has finished. Check the Full Plan tab for your complete history.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Week header */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Week {week.weekNumber} — {week.phase}
                {weekStatus === 'upcoming' && (
                  <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                    PREVIEW
                  </span>
                )}
                {weekStatus === 'current' && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    CURRENT
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                Week of {weekLabel} &bull; Target: <strong>{week.targetKm} km</strong> in {week.targetRuns} runs
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{daysUntilMarathon}</div>
              <div className="text-sm text-muted-foreground">days to marathon</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Focus */}
      {week.focus.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">
            {isActive ? "This week's focus:" : "Week 1 focus:"}
          </p>
          <ul className="text-sm text-blue-700 space-y-0.5">
            {week.focus.map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Planned runs for the week */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Planned Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {week.runs.map((run, i) => (
              <div
                key={i}
                className="bg-gray-50 border rounded-lg px-4 py-2 text-sm"
              >
                <span className="font-bold capitalize">{run.day.slice(0, 3)}</span>
                <span className="text-muted-foreground ml-2">{run.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User selector */}
      <div className="flex gap-2">
        {users.map((user) => (
          <Button
            key={user.id}
            variant={currentUserId === user.id ? 'default' : 'outline'}
            onClick={() => setCurrentUserId(user.id)}
          >
            {user.name}
          </Button>
        ))}
      </div>

      {/* Per-user section */}
      {users.map((user) => {
        const userWorkouts = workouts.filter((w) => w.user_id === user.id);
        const actualKm = userWorkouts.reduce((sum, w) => sum + (w.distance_km || 0), 0);
        const roundedKm = Math.round(actualKm * 10) / 10;
        const pct = week.targetKm > 0
          ? Math.min(100, Math.round((actualKm / week.targetKm) * 100))
          : 0;
        const status = getProgressStatus(actualKm, week.targetKm);
        const canEdit = user.id === currentUserId;

        const getWorkoutForDay = (day: DayOfWeek) =>
          userWorkouts.find((w) => w.day_of_week === day);

        return (
          <Card
            key={user.id}
            className={cn(
              'transition-all',
              canEdit && 'ring-2 ring-primary/30'
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg">{user.name}</CardTitle>
                {isActive && <StatusBanner status={status} userName={user.name} />}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{roundedKm} km logged</span>
                  <span className="text-muted-foreground">/ {week.targetKm} km target</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={cn(
                      'h-3 rounded-full transition-all',
                      !isActive && 'bg-blue-400',
                      isActive && status === 'on-track' && 'bg-green-500',
                      isActive && status === 'behind' && 'bg-yellow-500',
                      isActive && status === 'falling-off' && 'bg-red-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{pct}% of weekly target</p>
              </div>

              {/* Day-by-day grid — log on any day */}
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day) => {
                  const workout = getWorkoutForDay(day);
                  const isPlanned = plannedDays.has(day);
                  const plannedRun = week.runs.find((r) => r.day === day);

                  return (
                    <div key={day} className="flex flex-col items-center space-y-1">
                      <label className={cn(
                        "text-xs font-medium",
                        isPlanned ? "text-primary font-bold" : "text-muted-foreground"
                      )}>
                        {dayLabels[day]}
                        {isPlanned && <span className="text-[8px] block text-primary/60">preferred</span>}
                      </label>

                      {workout ? (
                        <div className="relative group">
                          <div className="w-16 h-20 rounded-lg border-2 bg-green-100 border-green-500 flex flex-col items-center justify-center p-1 text-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mb-0.5" />
                            <span className="text-xs font-bold text-green-800">
                              {workout.distance_km || 0} km
                            </span>
                            <span className="text-[10px] text-green-600">
                              {workout.duration}m
                            </span>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteRun(user.id, day)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => canEdit && setLogDay(logDay === day ? null : day)}
                          disabled={!canEdit}
                          className={cn(
                            "w-16 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors",
                            isPlanned
                              ? (canEdit
                                ? "border-primary/50 hover:border-primary hover:bg-primary/5 cursor-pointer"
                                : "border-primary/20 cursor-not-allowed opacity-50")
                              : (canEdit
                                ? "border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                                : "border-gray-200 cursor-not-allowed opacity-50")
                          )}
                        >
                          {canEdit && <Plus className={cn("h-5 w-5", isPlanned ? "text-primary/50" : "text-gray-400")} />}
                          {isPlanned && plannedRun && (
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              {plannedRun.distanceKm} km
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick log form */}
              {logDay && canEdit && (
                <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold">
                    Log run for <span className="capitalize">{logDay}</span>
                    {week.runs.find((r) => r.day === logDay) && (
                      <span className="text-muted-foreground font-normal ml-1">
                        (planned: {week.runs.find((r) => r.day === logDay)?.distanceKm} km)
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={logKm}
                        onChange={(e) => setLogKm(e.target.value)}
                        placeholder="Distance in km"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const km = parseFloat(logKm);
                        if (km > 0) handleLogRun(currentUserId, logDay, km);
                      }}
                      disabled={!logKm || parseFloat(logKm) <= 0}
                    >
                      Log Run
                    </Button>
                    <Button variant="outline" onClick={() => { setLogDay(null); setLogKm(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
