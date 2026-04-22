import * as SQLite from 'expo-sqlite';
import { DailyJournal, JournalEntry, Mood } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('journal.db');
  return db;
}

export async function setupDatabase() {
  const database = await getDatabase();
  
  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS daily_journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      title TEXT
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      daily_journal_id INTEGER NOT NULL,
      mood TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (daily_journal_id) REFERENCES daily_journals (id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_journals_date ON daily_journals(date DESC);
    CREATE INDEX IF NOT EXISTS idx_entries_journal_created ON journal_entries(daily_journal_id, created_at DESC);
  `);
}

export async function getTimeline(): Promise<DailyJournal[]> {
  const database = await getDatabase();
  const rawJournals = await database.getAllAsync<any>(
    'SELECT * FROM daily_journals ORDER BY date DESC'
  );

  const rawEntries = await database.getAllAsync<any>(
    'SELECT * FROM journal_entries ORDER BY daily_journal_id ASC, created_at ASC'
  );

  const entriesMap: Record<number, JournalEntry[]> = {};
  for (const row of rawEntries) {
    if (!entriesMap[row.daily_journal_id]) {
      entriesMap[row.daily_journal_id] = [];
    }
    entriesMap[row.daily_journal_id].push({
      id: row.id,
      dailyJournalId: row.daily_journal_id,
      mood: row.mood as Mood,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  return rawJournals.map(row => ({
    id: row.id,
    date: row.date,
    title: row.title,
    entries: entriesMap[row.id] || [],
  }));
}

export async function getDailyJournal(dateString: string): Promise<DailyJournal | null> {
  const database = await getDatabase();
  const rawJournal = await database.getFirstAsync<any>(
    'SELECT * FROM daily_journals WHERE date = ?',
    [dateString]
  );

  if (!rawJournal) return null;

  const rawEntries = await database.getAllAsync<any>(
    'SELECT * FROM journal_entries WHERE daily_journal_id = ? ORDER BY created_at ASC',
    [rawJournal.id]
  );

  const entries: JournalEntry[] = rawEntries.map(row => ({
    id: row.id,
    dailyJournalId: row.daily_journal_id,
    mood: row.mood as Mood,
    content: row.content,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));

  return {
    id: rawJournal.id,
    date: rawJournal.date,
    title: rawJournal.title,
    entries,
  };
}

export async function addDailyJournal(date: string, title?: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO daily_journals (date, title) VALUES (?, ?)',
    [date, title || null]
  );
  return result.lastInsertRowId;
}

export async function updateDailyTitle(id: number, title: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE daily_journals SET title = ? WHERE id = ?',
    [title, id]
  );
}

export async function addEntry(dailyJournalId: number, mood: Mood, content: string): Promise<number> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const result = await database.runAsync(
    'INSERT INTO journal_entries (daily_journal_id, mood, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [dailyJournalId, mood, content, now, now]
  );
  return result.lastInsertRowId;
}

export async function updateEntry(id: number, mood: Mood, content: string): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    'UPDATE journal_entries SET mood = ?, content = ?, updated_at = ? WHERE id = ?',
    [mood, content, now, id]
  );
}

export async function deleteEntry(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
}
