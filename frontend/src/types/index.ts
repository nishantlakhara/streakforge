export type TaskStatus = 'pending' | 'completed';
export type DayType = 'training' | 'rest' | 'sick' | 'travel';

export interface DrillItem {
  label: string;
  completed: boolean;
}

export interface DailyTask {
  id: string;
  label: string;
  category: string; // open string to allow custom categories
  completed: boolean;
}

export interface NutritionItem {
  id: string;
  label: string;
  category: string; // open string to allow custom categories
  completed: boolean;
}

export interface SleepData {
  bedTime: string;
  wakeTime: string;
  hours: number;
  score: 'excellent' | 'good' | 'needs-improvement';
}

export interface HydrationData {
  glasses: number;
}

export interface DailyRecord {
  date: string; // ISO format YYYY-MM-DD
  tasks: DailyTask[];
  nutrition: NutritionItem[];
  hydration: HydrationData;
  sleep: SleepData;
  notes?: string;
  type: DayType;
  templateId?: string; // Links back to template used to generate this record
  drills: DrillItem[]; // Checkable goal/action items for this day
}

export interface AppState {
  records: Record<string, DailyRecord>;
}

export interface DailyTemplate {
  id: string;
  name: string;
  type: DayType;
  tasks: Omit<DailyTask, 'id' | 'completed'>[];
  nutrition: Omit<NutritionItem, 'id' | 'completed'>[];
  drills: string[]; // Template stores drill labels as strings; records expand to DrillItem[]
  hydrationTarget: number;
}

export interface RoutineSnippet {
  id: string;
  name: string;
  tasks: Omit<DailyTask, 'id' | 'completed'>[];
}

export interface MealPlanSnippet {
  id: string;
  name: string;
  nutrition: Omit<NutritionItem, 'id' | 'completed'>[];
}

export interface DrillSetSnippet {
  id: string;
  name: string;
  drills: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  templates: DailyTemplate[];
  schedule: Record<string, string>; // YYYY-MM-DD -> templateId
  library: {
    routines: RoutineSnippet[];
    mealPlans: MealPlanSnippet[];
    drillSets: DrillSetSnippet[];
  };
}
