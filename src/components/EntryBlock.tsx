import { View, Text, StyleSheet } from 'react-native';
import { JournalEntry, Mood } from '../types';

const moodConfig: Record<Mood, { emoji: string, color: string }> = {
  Happy: { emoji: '🌿', color: '#E8F5E9' },
  Calm: { emoji: '✨', color: '#FFF8E1' },
  Sad: { emoji: '☁️', color: '#ECEFF1' },
  Excited: { emoji: '🌸', color: '#FCE4EC' },
  Tired: { emoji: '🌙', color: '#FFF3E0' },
};

export default function EntryBlock({ entry }: { entry: JournalEntry }) {
  const config = moodConfig[entry.mood];
  
  // Format simple time, e.g. 10:00 AM
  const timeString = new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: config.color }]}>
        <Text style={styles.badgeEmoji}>{config.emoji}</Text>
        <Text style={styles.badgeText}>{entry.mood}</Text>
      </View>
      <Text style={styles.content}>{entry.content}</Text>
      <Text style={styles.time}>{timeString}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  content: {
    fontSize: 17,
    lineHeight: 28,
    color: '#374151',
    marginBottom: 16,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  }
});
