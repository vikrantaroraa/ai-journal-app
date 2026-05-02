export type Mood = 'Happy' | 'Calm' | 'Sad' | 'Excited' | 'Tired' | 'Grateful' | 'Anxious' | 'Angry' | 'Productive' | 'Inspired';

export type EntryType = 'standard' | 'guided_reflection';

export interface JournalEntry {
  id: number;
  dailyJournalId: number;
  mood: Mood;
  content: string;
  images?: string[];
  iconTheme?: string;
  entryType?: EntryType;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyJournal {
  id: number;
  date: string; // YYYY-MM-DD
  title?: string;
  entries: JournalEntry[];
}
