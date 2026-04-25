export type Mood = 'Happy' | 'Calm' | 'Sad' | 'Excited' | 'Tired';

export interface JournalEntry {
  id: number;
  dailyJournalId: number;
  mood: Mood;
  content: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyJournal {
  id: number;
  date: string; // YYYY-MM-DD
  title?: string;
  entries: JournalEntry[];
}
