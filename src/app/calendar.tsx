import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import EntryBlock from '../components/EntryBlock';
import { useJournals } from '../hooks/useJournals';

export default function CalendarScreen() {
  const router = useRouter();
  const { timeline, refreshTimeline } = useJournals();

  useFocusEffect(
    useCallback(() => {
      refreshTimeline();
    }, [refreshTimeline])
  );

  const offset = new Date().getTimezoneOffset();
  const todayStr = new Date(new Date().getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    timeline.forEach(day => {
      if (day.entries.length > 0) {
        marks[day.date] = {
          marked: true,
          dotColor: '#CBD5E1',
        };
      }
    });

    // Always mark selected date with a solid dark circle
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#0F172A', selectedTextColor: '#FFFFFF' };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#0F172A', selectedTextColor: '#FFFFFF' };
    }

    return marks;
  }, [timeline, selectedDate]);

  const selectedJournal = useMemo(() => {
    return timeline.find(day => day.date === selectedDate);
  }, [timeline, selectedDate]);

  // Format selected date for display
  const displayDate = useMemo(() => {
    if (selectedDate === todayStr) return 'Today';
    const dateObj = new Date(`${selectedDate}T12:00:00`);
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }, [selectedDate, todayStr]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Calendar
          theme={{
            backgroundColor: '#F8FAFC',
            calendarBackground: '#F8FAFC',
            textSectionTitleColor: '#94A3B8',
            selectedDayBackgroundColor: '#0F172A',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#0F172A',
            dayTextColor: '#1E293B',
            textDisabledColor: '#CBD5E1',
            dotColor: '#94A3B8',
            selectedDotColor: '#FFFFFF',
            monthTextColor: '#0F172A',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '700',
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 11,
          }}
          markedDates={markedDates}
          onDayPress={(day: { dateString: string }) => {
            setSelectedDate(day.dateString);
          }}
          renderArrow={(direction: 'left' | 'right') => (
            <View style={styles.arrowContainer}>
              {direction === 'left' ? <ChevronLeft size={20} color="#0F172A" /> : <ChevronRight size={20} color="#0F172A" />}
            </View>
          )}
          style={styles.calendarWidget}
        />

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
            <Text style={styles.legendText}>Journal Entry</Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.bottomHeaderRow}>
            <Text style={styles.bottomTitle}>{displayDate}</Text>
            <TouchableOpacity onPress={() => router.push(`/journal/${selectedDate}`)}>
              <Text style={styles.writeLink}>Write</Text>
            </TouchableOpacity>
          </View>

          {!selectedJournal || selectedJournal.entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyTitle}>Nothing here — enjoy the day</Text>
              <Text style={styles.emptySub}>Tap Write to reflect on {displayDate.toLowerCase()}</Text>
            </View>
          ) : (
            <ScrollView style={styles.entryScroll} showsVerticalScrollIndicator={false}>
              {selectedJournal.entries.map(entry => (
                <EntryBlock
                  key={entry.id.toString()}
                  entry={entry}
                  onUpdate={() => refreshTimeline()} // Simplified for calendar view, user should use journal route for deep edits
                  onDelete={() => refreshTimeline()}
                />
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
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
    paddingTop: 16,
  },
  calendarWidget: {
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  bottomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  bottomTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  writeLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#94A3B8',
  },
  entryScroll: {
    flex: 1,
  }
});
