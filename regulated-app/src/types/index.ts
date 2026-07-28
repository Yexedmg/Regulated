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

export type Page = 'events' | 'reg-events' | 'log' | 'trends';
