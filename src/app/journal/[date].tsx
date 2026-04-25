import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useJournals } from '../../hooks/useJournals';
import { DailyJournal, Mood } from '../../types';
import EntryBlock from '../../components/EntryBlock';

const MOOD_OPTIONS: { value: Mood, emoji: string }[] = [
  { value: 'Happy', emoji: '🌿' },
  { value: 'Calm', emoji: '✨' },
  { value: 'Sad', emoji: '☁️' },
  { value: 'Excited', emoji: '🌸' },
  { value: 'Tired', emoji: '🌙' },
];

export default function DailyJournalScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { createOrGetDailyJournal, updateDailyTitle, addEntry, updateEntry, deleteEntry } = useJournals();
  const [journal, setJournal] = useState<DailyJournal | null>(null);
  
  const [titleInput, setTitleInput] = useState('');
  
  // New section internal state
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [entryContent, setEntryContent] = useState('');
  const contentInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (date) {
      loadJournal();
    }
  }, [date]);

  const loadJournal = async () => {
    const data = await createOrGetDailyJournal(date as string);
    if (data) {
      setJournal(data);
      setTitleInput(data.title || '');
    }
  };

  const handleSaveTitle = () => {
    if (journal && titleInput !== journal.title) {
      updateDailyTitle(journal.id, titleInput);
    }
  };

  const handleSelectMood = (mood: Mood) => {
    setSelectedMood(mood);
    // Focus the text input automatically
    setTimeout(() => {
      contentInputRef.current?.focus();
    }, 100);
  };

  const handleSaveEntry = async () => {
    if (!journal || !selectedMood || !entryContent.trim()) return;
    
    await addEntry(journal.id, selectedMood, entryContent.trim());
    
    // Reset internal state
    setIsAdding(false);
    setSelectedMood(null);
    setEntryContent('');
    
    // Reload local data to reflect newly added entry
    loadJournal();
  };

  // Convert "YYYY-MM-DD" back to date to print a nice header
  const dateObj = date ? new Date(date) : new Date();
  const offset = dateObj.getTimezoneOffset();
  const localDate = new Date(dateObj.getTime() + (offset*60*1000));
  const dateDisplay = localDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateDisplay}</Text>
          <TextInput 
            style={styles.titleInput}
            placeholder="Give this day a title..."
            placeholderTextColor="#9CA3AF"
            value={titleInput}
            onChangeText={setTitleInput}
            onBlur={handleSaveTitle}
          />
        </View>

        {journal?.entries.map(entry => (
          <EntryBlock 
            key={entry.id.toString()} 
            entry={entry} 
            onUpdate={async (content) => {
              await updateEntry(entry.id, entry.mood, content);
              loadJournal();
            }}
            onDelete={async () => {
              await deleteEntry(entry.id);
              loadJournal();
            }}
          />
        ))}

        {!isAdding ? (
          <TouchableOpacity style={styles.addSectionBtn} onPress={() => setIsAdding(true)}>
            <Text style={styles.addSectionText}>+ New Section</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.newSectionContainer}>
            {!selectedMood ? (
              <View style={styles.moodSelector}>
                <Text style={styles.moodPrompt}>HOW ARE YOU FEELING?</Text>
                <View style={styles.moodOptions}>
                  {MOOD_OPTIONS.map(opt => (
                    <TouchableOpacity 
                      key={opt.value} 
                      style={styles.moodBtn}
                      onPress={() => handleSelectMood(opt.value)}
                    >
                      <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                      <Text style={styles.moodText}>{opt.value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.composer}>
                <View style={[styles.moodBadgeSelected, { backgroundColor: '#F3F4F6' }]}>
                  <Text style={styles.moodEmoji}>{MOOD_OPTIONS.find(m => m.value === selectedMood)?.emoji}</Text>
                  <Text style={styles.moodText}>{selectedMood}</Text>
                </View>

                <TextInput 
                  ref={contentInputRef}
                  style={styles.composerInput}
                  placeholder="Start typing your thoughts here..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={entryContent}
                  onChangeText={setEntryContent}
                />

                <View style={styles.composerActions}>
                  <TouchableOpacity onPress={() => { setIsAdding(false); setSelectedMood(null); setEntryContent(''); }}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveBtn, !entryContent.trim() && { opacity: 0.5 }]} 
                    onPress={handleSaveEntry}
                    disabled={!entryContent.trim()}
                  >
                    <Text style={styles.saveBtnText}>Save Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 40,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  addSectionBtn: {
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  addSectionText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  newSectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
  },
  moodSelector: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  moodPrompt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 20,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  moodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  moodBadgeSelected: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  moodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  composer: {
    flex: 1,
  },
  composerInput: {
    fontSize: 17,
    lineHeight: 28,
    color: '#374151',
    minHeight: 120,
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  cancelText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  }
});
