import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useJournals } from '../../hooks/useJournals';
import { THEMES, getThemeIcon } from '../../utils/iconThemes';
import { Check } from 'lucide-react-native';

export default function IconThemesScreen() {
  const { iconTheme, updateIconTheme } = useJournals();
  const router = useRouter();

  const handleSelectTheme = async (themeId: string) => {
    await updateIconTheme(themeId);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Icon Theme', headerShadowVisible: false, headerStyle: { backgroundColor: '#F8FAFC' } }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Select Icon Theme</Text>
        <Text style={styles.subtitle}>Choose how moods are displayed across your journal.</Text>

        <View style={styles.themeList}>
          {THEMES.map(theme => {
            const isSelected = iconTheme === theme.id;
            return (
              <TouchableOpacity 
                key={theme.id} 
                style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                onPress={() => handleSelectTheme(theme.id)}
                activeOpacity={0.7}
              >
                <View style={styles.themeHeader}>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  {isSelected && <Check size={20} color="#4F46E5" />}
                </View>
                <Text style={styles.themeDesc}>{theme.description}</Text>
                
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <View style={styles.previewIcons}>
                    {getThemeIcon(theme.id, 'Happy', 28, '#4B5563')}
                    {getThemeIcon(theme.id, 'Calm', 28, '#4B5563')}
                    {getThemeIcon(theme.id, 'Excited', 28, '#4B5563')}
                    {getThemeIcon(theme.id, 'Inspired', 28, '#4B5563')}
                  </View>
                </View>
              </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    lineHeight: 24,
  },
  themeList: {
    gap: 16,
  },
  themeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  themeCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  themeDesc: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  previewIcons: {
    flexDirection: 'row',
    gap: 20,
  }
});
