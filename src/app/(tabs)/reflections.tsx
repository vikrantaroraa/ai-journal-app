import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useJournals } from '../../hooks/useJournals';

const GUIDED_PROMPTS = [
  {
    id: 1,
    question: 'What is one moment from today that felt genuinely peaceful?',
    placeholder: 'Write your thoughts here...',
  },
  {
    id: 2,
    question: 'What made you smile today?',
    placeholder: 'Write your observation here...',
  },
  {
    id: 3,
    question: 'Where did you find peace?',
    placeholder: 'Identify a moment of stillness...',
  },
  {
    id: 4,
    question: 'Where did you notice tension today, and how did you navigate it?',
    placeholder: 'Acknowledging tension is the first step to release...',
  },
  {
    id: 5,
    question: 'What moment today felt most authentic to your core values?',
    placeholder: 'Start writing here...',
  },
  {
    id: 6,
    question: 'Identify a challenge you encountered. How did you respond to it?',
    placeholder: 'Describe the friction and your reaction...',
  },
  {
    id: 7,
    question: 'What is one thing you learned about yourself this week?',
    placeholder: 'Reflect on your growth...',
  },
  {
    id: 8,
    question: 'What did the silence teach you?',
    placeholder: 'Listen to the quiet...',
  },
  {
    id: 9,
    question: 'Which task or thought are you choosing to let go of tonight?',
    placeholder: 'Give yourself permission to be finished for today...',
  },
  {
    id: 10,
    question: 'What is one thing you are looking forward to tomorrow?',
    placeholder: 'One word to carry forward...',
  },
];

export default function ReflectionsScreen() {
  const { createOrGetDailyJournal, addEntry, refreshTimeline } = useJournals();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [threeWords, setThreeWords] = useState<[string, string, string]>(['', '', '']);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Reset answers on focus for a fresh session
      setAnswers({});
      setThreeWords(['', '', '']);
    }, [])
  );

  const handleChangeAnswer = (promptId: number, text: string) => {
    setAnswers(prev => ({ ...prev, [promptId]: text }));
  };

  const hasContent = Object.values(answers).some(a => a.trim().length > 0) || threeWords.some(w => w.trim().length > 0);

  const handleSaveReflection = async () => {
    if (!hasContent || isSaving) return;

    setIsSaving(true);
    try {
      // Build the formatted content from Q&A pairs
      const contentParts = GUIDED_PROMPTS
        .filter(p => answers[p.id]?.trim())
        .map(p => `**${p.question}**\n${answers[p.id]!.trim()}`);

      // Add the three words question if any word was entered
      const filledWords = threeWords.filter(w => w.trim());
      if (filledWords.length > 0) {
        contentParts.push(`**In three words, describe the underlying emotion of your day.**\n${filledWords.join(', ')}`);
      }

      const formattedContent = contentParts.join('\n\n');

      // Get today's date string
      const offset = new Date().getTimezoneOffset();
      const todayStr = new Date(new Date().getTime() - offset * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Create or get the daily journal for today
      const journal = await createOrGetDailyJournal(todayStr);

      // Save as a guided_reflection entry with mood 'Grateful' as default
      await addEntry(journal.id, 'Grateful', formattedContent, undefined, 'guided_reflection');
      await refreshTimeline();

      // Reset and show confirmation
      setAnswers({});
      setThreeWords(['', '', '']);
      Alert.alert('Reflection Saved', 'Your guided reflection has been saved to your journal.');
    } catch (e) {
      console.error('Failed to save reflection:', e);
      Alert.alert('Error', 'Failed to save your reflection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerLabel}>DAILY GUIDED PRACTICE</Text>
            <Text style={styles.headerTitle}>Evening Reflections</Text>
            <Text style={styles.headerSubtitle}>
              Take a moment to breathe. Let these questions guide you into a state of intentional rest.
            </Text>
          </View>

          {/* Prompts */}
          <View style={styles.promptsContainer}>
            {GUIDED_PROMPTS.map((prompt, index) => (
              <View key={prompt.id} style={styles.promptBlock}>
                <View style={styles.promptHeader}>
                  <Text style={styles.promptNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <Text style={styles.promptQuestion}>{prompt.question}</Text>
                </View>
                <TextInput
                  style={styles.promptInput}
                  placeholder={prompt.placeholder}
                  placeholderTextColor="#B0B8C1"
                  multiline
                  textAlignVertical="top"
                  value={answers[prompt.id] || ''}
                  onChangeText={(text) => handleChangeAnswer(prompt.id, text)}
                />
                {index < GUIDED_PROMPTS.length - 1 && (
                  <View style={styles.promptDivider} />
                )}
              </View>
            ))}
          </View>

          {/* Three Words Question */}
          <View style={styles.threeWordsBlock}>
            <View style={styles.promptHeader}>
              <Text style={styles.promptNumber}>
                {String(GUIDED_PROMPTS.length + 1).padStart(2, '0')}
              </Text>
              <Text style={styles.promptQuestion}>
                In three words, describe the underlying emotion of your day.
              </Text>
            </View>
            <View style={styles.threeWordsRow}>
              {[0, 1, 2].map(i => (
                <TextInput
                  key={i}
                  style={styles.wordInput}
                  placeholder={`Word ${i + 1}`}
                  placeholderTextColor="#B0B8C1"
                  value={threeWords[i]}
                  onChangeText={(text) => {
                    setThreeWords(prev => {
                      const next: [string, string, string] = [...prev];
                      next[i] = text;
                      return next;
                    });
                  }}
                />
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, !hasContent && styles.saveButtonDisabled]}
            onPress={handleSaveReflection}
            activeOpacity={0.8}
            disabled={!hasContent || isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Reflection'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.privacyNote}>YOUR SANCTUARY IS PRIVATE AND ENCRYPTED</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 24,
    paddingBottom: 32,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#94A3B8',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    maxWidth: '90%',
  },
  promptsContainer: {
    paddingHorizontal: 24,
  },
  promptBlock: {
    marginBottom: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 14,
  },
  promptNumber: {
    fontSize: 42,
    fontWeight: '200',
    color: '#D1D5DB',
    lineHeight: 44,
    marginTop: -4,
  },
  promptQuestion: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 26,
    paddingTop: 8,
  },
  promptInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 18,
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    minHeight: 100,
    fontStyle: 'italic',
  },
  promptDivider: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginTop: 32,
    marginHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#1E293B',
    marginHorizontal: 24,
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  privacyNote: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#B0B8C1',
    marginTop: 20,
    marginBottom: 10,
  },
  threeWordsBlock: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  threeWordsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  wordInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
  },
});
