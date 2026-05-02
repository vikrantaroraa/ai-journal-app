import { useState, useEffect, useCallback } from 'react';
import { DailyJournal, JournalEntry, Mood } from '../types';
import * as db from '../database/db';

export function useJournals() {
  const [timeline, setTimeline] = useState<DailyJournal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [iconTheme, setIconTheme] = useState<string>('emoji');

  // Initialize DB and fetch timeline
  const loadTimeline = useCallback(async () => {
    try {
      setIsLoading(true);
      await db.setupDatabase();
      const theme = await db.getSetting('iconTheme', 'emoji');
      setIconTheme(theme);
      const data = await db.getTimeline();
      setTimeline(data);
    } catch (e) {
      console.error('Failed to load timeline', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  // Helper: Find a specific date object quickly
  const getTodayJournal = (dateStr: string) => {
    return timeline.find(j => j.date === dateStr);
  };

  const createOrGetDailyJournal = async (dateStr: string, title?: string) => {
    let existing = await db.getDailyJournal(dateStr);
    if (!existing) {
      const newId = await db.addDailyJournal(dateStr, title);
      existing = { id: newId, date: dateStr, title, entries: [] };
      // Optimistic upate timeline
      setTimeline(prev => [existing!, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    }
    return existing;
  };

  const updateDailyTitle = async (id: number, title: string) => {
    await db.updateDailyTitle(id, title);
    setTimeline(prev => prev.map(journal => 
      journal.id === id ? { ...journal, title } : journal
    ));
  };

  const addEntry = async (dailyJournalId: number, mood: Mood, content: string, images?: string[], entryType: 'standard' | 'guided_reflection' = 'standard') => {
    const newEntryId = await db.addEntry(dailyJournalId, mood, content, images, iconTheme, entryType);
    const newEntry: JournalEntry = {
      id: newEntryId,
      dailyJournalId,
      mood,
      content,
      images,
      iconTheme,
      entryType,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTimeline(prev => prev.map(journal => {
      if (journal.id === dailyJournalId) {
        return {
          ...journal,
          // Append entry
          entries: [...journal.entries, newEntry]
        };
      }
      return journal;
    }));
  };

  const updateEntry = async (entryId: number, mood: Mood, content: string, images?: string[]) => {
    await db.updateEntry(entryId, mood, content, images);
    
    setTimeline(prev => prev.map(journal => ({
      ...journal,
      entries: journal.entries.map(entry => 
        entry.id === entryId 
          ? { ...entry, mood, content, images, updatedAt: new Date() } 
          : entry
      )
    })));
  };

  const deleteEntry = async (entryId: number) => {
    await db.deleteEntry(entryId);

    setTimeline(prev => prev.map(journal => ({
      ...journal,
      entries: journal.entries.filter(entry => entry.id !== entryId)
    })));
  };

  const updateIconTheme = async (theme: string) => {
    await db.setSetting('iconTheme', theme);
    setIconTheme(theme);
  };

  return {
    timeline,
    isLoading,
    iconTheme,
    getTodayJournal,
    createOrGetDailyJournal,
    updateDailyTitle,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshTimeline: loadTimeline,
    updateIconTheme
  };
}
