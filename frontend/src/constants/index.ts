import { DailyTask, NutritionItem } from '../types';

export const MOTIVATIONAL_QUOTES = [
  "Today's discipline becomes tomorrow's result.",
  "Small steps every day lead to big breakthroughs.",
  "Consistency beats motivation — show up anyway.",
  "The secret to getting ahead is getting started.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Don't count the days. Make the days count.",
  "Hard work beats talent when talent doesn't work hard.",
  "You don't have to be great to start, but you have to start to be great.",
  "What you do today can improve all your tomorrows.",
  "Progress, not perfection.",
];

export const DEFAULT_TASKS: Omit<DailyTask, 'id' | 'completed'>[] = [
  { label: 'Morning Routine', category: 'morning' },
  { label: 'Exercise / Movement', category: 'activity' },
  { label: 'Deep Work Block', category: 'focus' },
  { label: 'Evening Wind-Down', category: 'recovery' },
];

export const DEFAULT_NUTRITION: Omit<NutritionItem, 'id' | 'completed'>[] = [
  { label: 'Protein Source', category: 'breakfast' },
  { label: 'Fruit or Veg', category: 'breakfast' },
  { label: 'Balanced Meal', category: 'lunch' },
  { label: 'Vegetables', category: 'lunch' },
  { label: 'Light Dinner', category: 'dinner' },
  { label: 'Hydration Goal', category: 'dinner' },
];
