'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, WorkoutEntry, DayOfWeek, DAYS } from '@/lib/types';
import { getUpcomingOrCurrentWeek, MarathonWeek, MarathonRun, MARATHON_DATE, PLAN_START } from '@/lib/marathon-plan';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Target,
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

function getCoachingAdvice(
  actualKm: number,
  targetKm: number,
  userWorkouts: WorkoutEntry[],
  plannedRuns: MarathonRun[]
): string {
  const now = new Date();
  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Mon, 6=Sun
  const loggedDays = new Set(userWorkouts.map((w) => w.day_of_week));
  const remainingRuns = plannedRuns.filter((r) => {
    const runIndex = DAYS.indexOf(r.day);
    return runIndex >= todayIndex && !loggedDays.has(r.day);
  });
  const kmLeft = Math.round((targetKm - actualKm) * 10) / 10;

  if (kmLeft <= 0) {
    return 'Target reached — every extra km is a bonus!';
  }
  if (remainingRuns.length === 0) {
    return `${kmLeft} km left — squeeze in a run before the week ends!`;
  }
  const perRun = Math.round((kmLeft / remainingRuns.length) * 10) / 10;
  if (remainingRuns.length === 1) {
    return `${kmLeft} km left — 1 run to go, aim for ${perRun} km.`;
  }
  return `${kmLeft} km left — ${remainingRuns.length} runs remaining, ~${perRun} km each.`;
}

function StatusDot({ status }: { status: ProgressStatus }) {
  const color = status === 'on-track'
    ? 'bg-green-500'
    : status === 'behind'
      ? 'bg-orange-500'
      : 'bg-red-500';
  return <span className={`inline-block h-3 w-3 rounded-full ${color}`} />;
}

export default function ThisWeek() {
  const [users, setUsers] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logDay, setLogDay] = useState<DayOfWeek | null>(null);
  const [logKm, setLogKm] = useState('');
  const [logForUser, setLogForUser] = useState<number | null>(null);
  const [dismissedAdvice, setDismissedAdvice] = useState<Set<number>>(new Set());

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

  const isActive = weekStatus === 'current';

  return (
    <div className="space-y-6">
      {/* User cards at top */}
      <div className="grid md:grid-cols-2 gap-4">
        {users.map((user) => {
          const userWorkouts = workouts.filter((w) => w.user_id === user.id);
          const actualKm = userWorkouts.reduce((sum, w) => sum + (w.distance_km || 0), 0);
          const roundedKm = Math.round(actualKm * 10) / 10;
          const pct = week.targetKm > 0
            ? Math.min(100, Math.round((actualKm / week.targetKm) * 100))
            : 0;
          const runs = userWorkouts.length;
          const status = getProgressStatus(actualKm, week.targetKm);
          const isLogging = logForUser === user.id;

          return (
            <div
              key={user.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e293b] to-[#334155] p-5 sm:p-6 text-white"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#5B7FFF]/15 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 space-y-4">
                {/* Name and status */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">{user.name}</h2>
                  {isActive && <StatusDot status={status} />}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-5">
                  <div>
                    <div className="text-2xl font-black text-[#5B7FFF]">{roundedKm}<span className="text-sm ml-0.5">km</span></div>
                    <p className="text-[10px] text-gray-400">logged</p>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#5B7FFF]">{runs}</div>
                    <p className="text-[10px] text-gray-400">{runs === 1 ? 'run' : 'runs'}</p>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white/60">{week.targetKm}<span className="text-sm ml-0.5">km</span></div>
                    <p className="text-[10px] text-gray-400">target</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div
                      className={cn(
                        'h-2.5 rounded-full animate-fill',
                        !isActive && 'bg-blue-400',
                        isActive && status === 'on-track' && 'bg-green-500',
                        isActive && status === 'behind' && 'bg-yellow-500',
                        isActive && status === 'falling-off' && 'bg-orange-500'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}% of weekly target</p>
                </div>

                {/* Coaching advice bubble */}
                {isActive && !dismissedAdvice.has(user.id) && (
                  <div className="flex items-start gap-2 bg-white/10 backdrop-blur rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-300 flex-1">
                      {getCoachingAdvice(actualKm, week.targetKm, userWorkouts, week.runs)}
                    </p>
                    <button
                      onClick={() => setDismissedAdvice((prev) => new Set(prev).add(user.id))}
                      className="text-gray-400 hover:text-white shrink-0 mt-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* + Log Run button */}
                {!isLogging && (
                  <button
                    onClick={() => { setLogForUser(user.id); setLogDay(null); setLogKm(''); }}
                    className="flex items-center gap-2 bg-[#5B7FFF] hover:bg-[#4A6FEE] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Log Run
                  </button>
                )}

                {/* Log form */}
                {isLogging && (
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-white">Log a run</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={logDay || ''}
                        onChange={(e) => setLogDay(e.target.value as DayOfWeek)}
                        className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7FFF]"
                      >
                        <option value="" disabled className="text-gray-900">Select day</option>
                        {DAYS.map((day) => (
                          <option key={day} value={day} className="text-gray-900 capitalize">
                            {dayLabels[day]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={logKm}
                        onChange={(e) => setLogKm(e.target.value)}
                        placeholder="km"
                        className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FFF]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const km = parseFloat(logKm);
                          if (km > 0 && logDay) handleLogRun(user.id, logDay, km);
                        }}
                        disabled={!logKm || parseFloat(logKm) <= 0 || !logDay}
                        className="bg-[#5B7FFF] hover:bg-[#4A6FEE] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setLogForUser(null); setLogDay(null); setLogKm(''); }}
                        className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
