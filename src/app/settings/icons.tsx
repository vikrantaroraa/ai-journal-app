import { Stack, useRouter } from 'expo-router';
import { Check, Square } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useJournals } from '../../hooks/useJournals';
import { Mood } from '../../types';
import { THEMES, getThemeIcon } from '../../utils/iconThemes';

export default function IconThemesScreen() {
  const { iconTheme, updateIconTheme } = useJournals();
  const router = useRouter();

  const handleSelectTheme = async (themeId: string) => {
    await updateIconTheme(themeId);
  };

  const ALL_MOODS: Mood[] = [
    'Happy', 'Calm', 'Sad', 'Excited', 'Tired',
    'Grateful', 'Anxious', 'Angry', 'Productive', 'Inspired'
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{
        title: 'Mood Style',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#F0F4F8' },
        headerTintColor: '#1E293B'
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.themeList}>
          {THEMES.map((theme, index) => {
            const isSelected = iconTheme === theme.id;
            const isLast = index === THEMES.length - 1;
            return (
              <View key={theme.id}>
                <TouchableOpacity
                  style={styles.themeHeaderRow}
                  onPress={() => handleSelectTheme(theme.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.themeName}>{theme.name}</Text>
                  {isSelected ? (
                    <View style={styles.checkboxSelected}>
                      <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : (
                    <Square size={24} color="#94A3B8" strokeWidth={2} />
                  )}
                </TouchableOpacity>

                <View style={styles.previewGrid}>
                  {ALL_MOODS.map(mood => (
                    <View key={mood} style={styles.iconCell}>
                      {getThemeIcon(theme.id, mood, 28, '#4B5563')}
                    </View>
                  ))}
                </View>

                {!isLast && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Slightly blueish light grey matching the image
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  themeList: {
    flexDirection: 'column',
  },
  themeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B', // Muted text for the label
  },
  checkboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingBottom: 24,
    rowGap: 24,
    justifyContent: 'space-between',
  },
  iconCell: {
    width: '18%', // Roughly fits 5 icons per row tightly
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  }
});
