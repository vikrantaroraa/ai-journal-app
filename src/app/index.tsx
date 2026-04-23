import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useJournals } from '../hooks/useJournals';

// Mood emoji map
const moodEmojis: Record<string, string> = {
  Happy: '🌿',
  Calm: '✨',
  Sad: '☁️',
  Excited: '🌸',
  Tired: '🌙',
};

export default function Home() {
  const { timeline, isLoading, refreshTimeline } = useJournals();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshTimeline();
    }, [refreshTimeline])
  );

  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleNewEntry = () => {
    const offset = new Date().getTimezoneOffset();
    const today = new Date(new Date().getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
    router.push(`/journal/${today}`);
  };

  const getTodayTile = () => {
    const d = new Date();
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: d.getDate().toString()
    };
  };

  const todayTileInfo = getTodayTile();

  // Create a flattened list of all individual entries to match the 3rd image layout
  const allEntries = useMemo(() => {
    const flat = timeline.flatMap(day =>
      day.entries.map(entry => ({
        ...entry,
        parentDateString: day.date // string 'YYYY-MM-DD'
      }))
    );
    // Sort from newest exactly generated time to oldest
    return flat.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [timeline]);

  const renderItem = ({ item }: { item: any }) => {
    // Use the parent Journal's exact date string (e.g., "2026-04-22")
    // Appending T12:00:00 forces it to midday safely avoiding any timezone shifts.
    const dateObj = new Date(`${item.parentDateString}T12:00:00`);
    const dayNumeric = dateObj.getDate().toString();
    const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const emoji = moodEmojis[item.mood] || '😐';

    return (
      <TouchableOpacity
        style={styles.entryCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/journal/${item.parentDateString}`)}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryDateBlock}>
            <Text style={styles.entryDayNum}>{dayNumeric}</Text>
            <Text style={styles.entryMonth}>{monthShort}</Text>
          </View>
          <Text style={styles.entryEmoji}>{emoji}</Text>
        </View>
        <Text style={styles.entryContent}>{item.content}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <TouchableOpacity 
            style={styles.todayTile}
            activeOpacity={0.8}
            onPress={() => router.push('/calendar')}
          >
            <Text style={styles.todayTileDay}>{todayTileInfo.day}</Text>
            <Text style={styles.todayTileDate}>{todayTileInfo.date}</Text>
          </TouchableOpacity>
        </View>

        {/* Body Section - Flattened Entries List */}
        <FlatList
          data={allEntries}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? <Text style={styles.emptyText}>No entries yet. Tap the + to start!</Text> : null
          }
        />

        {/* Bottom Left FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleNewEntry} activeOpacity={0.9}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  todayTile: {
    backgroundColor: '#95A4FE', // Original rich indigo made translucent
    borderRadius: 14,
    width: 52, // Fixed width and height for a perfect small square
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  todayTileDay: {
    color: '#4956a0ff', // Light periwinkle blue
    fontSize: 12,
    fontWeight: '800',
    marginBottom: -1, // Squeeze text closely together
    letterSpacing: 0.5,
  },
  todayTileDate: {
    color: '#4956a0ff',
    fontSize: 18,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Room for the FAB
  },
  entryCard: {
    backgroundColor: '#E2E8F0', // Soft subtle bluish-grey matching Image 3 feel
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryDateBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  entryDayNum: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  entryMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  entryEmoji: {
    fontSize: 32,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 60,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20, // Shifted to right side
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(32, 35, 66, 0.9)', // Solid rich indigo with a tint of translucency
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
    marginTop: -2,
  }
});
