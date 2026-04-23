import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useJournals } from '../hooks/useJournals';
import { useMemo } from 'react';

export default function CalendarScreen() {
  const router = useRouter();
  const { timeline } = useJournals();

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    timeline.forEach(day => {
      if (day.entries.length > 0) {
        marks[day.date] = {
          marked: true,
          dotColor: '#95A4FE', // Match the periwinkle aesthetic
        };
      }
    });
    
    // Always mark today with a subtle highlight
    const offset = new Date().getTimezoneOffset();
    const todayStr = new Date(new Date().getTime() - (offset*60*1000)).toISOString().split('T')[0];
    
    if (marks[todayStr]) {
      marks[todayStr] = { ...marks[todayStr], selected: true, selectedColor: '#4956a0' };
    } else {
      marks[todayStr] = { selected: true, selectedColor: '#4956a0' };
    }
    
    return marks;
  }, [timeline]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Calendar
          // Custom style
          theme={{
            backgroundColor: '#F8FAFC',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#64748B',
            selectedDayBackgroundColor: '#4956a0', // Deep Indigo map
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#95A4FE',
            dayTextColor: '#0F172A',
            textDisabledColor: '#CBD5E1',
            dotColor: '#95A4FE',
            selectedDotColor: '#ffffff',
            arrowColor: '#4956a0',
            monthTextColor: '#0F172A',
            indicatorColor: '#4956a0',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
          markedDates={markedDates}
          onDayPress={(day: { dateString: string }) => {
            router.push(`/journal/${day.dateString}`);
          }}
          style={styles.calendarWidget}
        />
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
    paddingHorizontal: 16,
  },
  calendarWidget: {
    borderRadius: 16,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  }
});
