export interface DysregulationEvent {
  id: string;
  name: string;
  effect: number; // 0-10
}

export interface RegulationEvent {
  id: string;
  name: string;
  effect: number; // 0-10
}

export interface DayLog {
  id: string;
  date: string; // YYYY-MM-DD
  eventIds: string[];
  regEventIds: string[];
  notes?: string;
}

export interface Goal {
  id: string;
  text: string;
  targetDays?: number;
  startDate: string; // YYYY-MM-DD
  completedDate?: string; // YYYY-MM-DD
}

export interface Fix {
  id: string;
  text: string;
  createdAt: string; // ISO timestamp
}

export type Page = 'events' | 'reg-events' | 'log' | 'trends' | 'goal' | 'fix';
