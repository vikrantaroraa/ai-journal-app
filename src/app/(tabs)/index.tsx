import { useFocusEffect, useRouter } from 'expo-router';
import { BookOpen, ChevronRight, PenLine, Settings } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJournals } from '../../hooks/useJournals';

import { getThemeIcon } from '../../utils/iconThemes';

export default function Home() {
  const { timeline, isLoading, refreshTimeline, iconTheme } = useJournals();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      refreshTimeline();
    }, [refreshTimeline])
  );

  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    // Kept for future use if needed
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
    const hasImages = item.images && item.images.length > 0;
    const maxLines = hasImages ? 2 : 3;

    const displayTheme = item.iconTheme || 'emoji';

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
          <View style={styles.entryEmojiContainer}>
            {getThemeIcon(displayTheme, item.mood, 22)}
          </View>
        </View>
        <View style={styles.entryBody}>
          <Text style={[styles.entryContent, { flex: 1 }]} numberOfLines={maxLines}>{item.content}</Text>
          {hasImages && (
            <Image source={{ uri: item.images[0] }} style={styles.entryThumb} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>OpenJournal</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/settings/icons')} style={styles.iconBtn}>
              <Settings size={22} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateBadge}
              activeOpacity={0.8}
              onPress={() => router.push('/calendar')}
            >
              <Text style={styles.dateBadgeDay}>{todayTileInfo.day}</Text>
              <Text style={styles.dateBadgeDate}>{todayTileInfo.date}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Banner */}
        <TouchableOpacity style={styles.actionBanner} onPress={handleNewEntry} activeOpacity={0.9}>
          <View style={styles.actionBannerLeft}>
            <View style={styles.actionBannerIcon}>
              <PenLine size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionBannerText}>How was your day?</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Body Section - Flattened Entries List */}
        <FlatList
          data={allEntries}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIconBadge}>
                  <BookOpen size={32} color="#94A3B8" />
                </View>
                <Text style={styles.emptyStateTitle}>No entries yet</Text>
                <Text style={styles.emptyStateSub}>Begin your reflection today</Text>
              </View>
            ) : null
          }
        />

        {/* Bottom Right FAB */}
        <TouchableOpacity
          style={[styles.fab, { bottom: 16 }]}
          onPress={handleNewEntry}
          activeOpacity={0.9}
        >
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
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeDay: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: -2,
    letterSpacing: 0.5,
  },
  dateBadgeDate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  actionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Room for the FAB
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
  entryEmojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  entryBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  entryThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyStateIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 15,
    color: '#64748B',
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
