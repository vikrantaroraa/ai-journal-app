import * as SQLite from 'expo-sqlite';
import { DailyJournal, JournalEntry, Mood } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

function parseImages(imageUriCol: any): string[] | undefined {
  if (!imageUriCol || imageUriCol === '') return undefined;
  try {
    const parsed = JSON.parse(imageUriCol);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // If it fails to parse, it means it's a legacy standard un-arrayed string 
    if (typeof imageUriCol === 'string') return [imageUriCol];
  }
  return undefined;
}

// Escape single quotes for safe use in execAsync raw SQL
function esc(value: string): string {
  return value.replace(/'/g, "''");
}

export async function getDatabase() {
  if (db) return db;
  // useNewConnection: true avoids NullPointerException from shared native handles
  db = await SQLite.openDatabaseAsync('journal.db', { useNewConnection: true });
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

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_journals_date ON daily_journals(date DESC);
    CREATE INDEX IF NOT EXISTS idx_entries_journal_created ON journal_entries(daily_journal_id, created_at DESC);
  `);
  
  // Feature 3 migration: Safely add image_uri if it doesn't exist
  const tableInfo = await database.getAllAsync<any>('PRAGMA table_info(journal_entries)');
  const hasImageUri = tableInfo.some(col => col.name === 'image_uri');
  
  if (!hasImageUri) {
    try {
      await database.execAsync('ALTER TABLE journal_entries ADD COLUMN image_uri TEXT;');
    } catch (e) {
      console.log("Migration skipped (column likely exists):", e);
    }
  }

  const hasIconTheme = tableInfo.some(col => col.name === 'icon_theme');
  if (!hasIconTheme) {
    try {
      await database.execAsync("ALTER TABLE journal_entries ADD COLUMN icon_theme TEXT DEFAULT 'emoji';");
    } catch (e) {
      console.log("Migration skipped for icon_theme:", e);
    }
  }
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
      images: parseImages(row.image_uri),
      iconTheme: row.icon_theme || 'emoji',
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
    dateString
  );

  if (!rawJournal) return null;

  const rawEntries = await database.getAllAsync<any>(
    'SELECT * FROM journal_entries WHERE daily_journal_id = ? ORDER BY created_at ASC',
    rawJournal.id
  );

  const entries: JournalEntry[] = rawEntries.map(row => ({
    id: row.id,
    dailyJournalId: row.daily_journal_id,
    mood: row.mood as Mood,
    content: row.content,
    images: parseImages(row.image_uri),
    iconTheme: row.icon_theme || 'emoji',
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
  await database.execAsync(
    `INSERT INTO daily_journals (date, title) VALUES ('${esc(date)}', '${esc(title || '')}')`
  );
  const row = await database.getFirstAsync<any>('SELECT last_insert_rowid() as id');
  return row.id;
}

export async function updateDailyTitle(id: number, title: string): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(
    `UPDATE daily_journals SET title = '${esc(title)}' WHERE id = ${id}`
  );
}

export async function addEntry(dailyJournalId: number, mood: Mood, content: string, images?: string[], iconTheme: string = 'emoji'): Promise<number> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const dbImageStr = images && images.length > 0 ? JSON.stringify(images) : '';
  await database.execAsync(
    `INSERT INTO journal_entries (daily_journal_id, mood, content, image_uri, icon_theme, created_at, updated_at) VALUES (${dailyJournalId}, '${esc(mood)}', '${esc(content)}', '${esc(dbImageStr)}', '${esc(iconTheme)}', '${esc(now)}', '${esc(now)}')`
  );
  const row = await database.getFirstAsync<any>('SELECT last_insert_rowid() as id');
  return row.id;
}

export async function updateEntry(id: number, mood: Mood, content: string, images?: string[]): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const dbImageStr = images && images.length > 0 ? JSON.stringify(images) : '';
  await database.execAsync(
    `UPDATE journal_entries SET mood = '${esc(mood)}', content = '${esc(content)}', image_uri = '${esc(dbImageStr)}', updated_at = '${esc(now)}' WHERE id = ${id}`
  );
}

export async function deleteEntry(id: number): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`DELETE FROM journal_entries WHERE id = ${id}`);
}

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?`,
    [key]
  );
  return result?.value ?? defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(
    `INSERT INTO settings (key, value) VALUES ('${esc(key)}', '${esc(value)}') 
     ON CONFLICT(key) DO UPDATE SET value = '${esc(value)}'`
  );
}
