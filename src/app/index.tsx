import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useJournals } from '../hooks/useJournals';

export default function Home() {
  const { timeline, isLoading } = useJournals();
  const router = useRouter();

  const handleNewEntry = () => {
    // Get YYYY-MM-DD in local time ideally, simple approach:
    const offset = new Date().getTimezoneOffset();
    const today = new Date(new Date().getTime() - (offset*60*1000)).toISOString().split('T')[0];
    router.push(`/journal/${today}`);
  };

  const renderItem = ({ item }: any) => {
    // Treat the date as the title fallback if title is empty
    const dateObj = new Date(item.date);
    const offset = dateObj.getTimezoneOffset();
    const localDate = new Date(dateObj.getTime() + (offset*60*1000));
    
    const displayTitle = item.title || localDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/journal/${item.date}`)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardTitle}>{displayTitle}</Text>
        <Text style={styles.cardSubtitle}>{item.entries.length} section{item.entries.length !== 1 ? 's' : ''}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList 
        data={timeline}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No journals yet. Tap below to start your first entry!</Text> : null
        }
      />
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNewEntry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>+ New Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    padding: 24,
    paddingBottom: 100, // Make room for footer
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
  },
  button: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
