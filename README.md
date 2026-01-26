# Gym Buddy - Workout Tracker

A simple web app for two friends to track their weekly workouts with a penalty system for missed days.

## Features

- **Manual Workout Logging**: Checkbox interface for each day of the week (Monday-Sunday)
- **Weekly Challenge**: Complete 5 workouts per week to avoid penalties
- **Penalty System**: R25 per missed day below the 5-workout goal
- **Head-to-Head Competition**: Side-by-side comparison of both users' progress
- **History Tracking**: View past weeks and accumulated penalties
- **Summary Dashboard**: See total money owed between users

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React
- **Database**: SQLite (better-sqlite3)
- **Date Handling**: date-fns

## Getting Started

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## How It Works

1. **Weekly Tracking**: Each week runs from Monday to Sunday
2. **Goal**: Complete 5 workouts per week
3. **Penalties**: If you complete fewer than 5 workouts, you owe R25 for each missed day
   - Example: 3 workouts completed = 2 missed days = R50 penalty
4. **Net Balance**: The app calculates who owes whom based on the difference in penalties
5. **Manual Payment**: No payment processing - settle up manually between friends

## Pages

- **Dashboard** (`/`): Current week's workout tracking with real-time competition view
- **History** (`/history`): Past weeks' performance and penalties
- **Summary** (`/summary`): Overall statistics and net balance owed

## Database

The app uses SQLite with two main tables:
- `users`: Stores the two fixed users
- `workouts`: Tracks daily workout completion for each week

The database file (`gym-buddy.db`) is created automatically on first run.

## Customization

To change user names, modify the initial data in `lib/db.ts`:
```typescript
db.prepare('INSERT INTO users (name) VALUES (?)').run('Your Name');
db.prepare('INSERT INTO users (name) VALUES (?)').run('Friend Name');
```

To adjust the penalty amount or workout goal, edit `lib/types.ts`:
```typescript
export const GOAL_WORKOUTS = 5;
export const PENALTY_PER_DAY = 25;
```

## Notes

- No authentication required - app is designed for two fixed users
- No payment processing - track penalties only
- Mobile-friendly responsive design
- Data persists locally in SQLite database
