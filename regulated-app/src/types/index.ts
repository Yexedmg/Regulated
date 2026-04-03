export interface DysregulationEvent {
  id: string;
  name: string;
  effect: number; // 0-10
}

export interface DayLog {
  id: string;
  date: string; // YYYY-MM-DD
  eventIds: string[];
  notes?: string;
}

export type Page = 'events' | 'log' | 'trends';
