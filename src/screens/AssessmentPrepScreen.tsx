import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

type PrepState = { checked: string[]; questions: string };
const STORAGE_KEY = 'different-minds:assessment-prep:v1';

const ITEMS = [
  { id: 'details', title: 'Confirm the practical details', text: 'Date, time, location or video link, expected length and any instructions from the provider.' },
  { id: 'forms', title: 'Check the forms you were actually asked to complete', text: 'Use the provider’s instructions rather than filling in extra questionnaires because you think you should.' },
  { id: 'health', title: 'Gather relevant health and medication information', text: 'Have an accurate list available if the provider has asked for medical or medication history.' },
  { id: 'examples', title: 'Think of genuine everyday examples', text: 'Work, study, home, relationships, organisation or other areas where difficulties affect you. Use your own words.' },
  { id: 'childhood', title: 'Gather childhood or school history if it is available', text: 'Do not panic if records do not exist. Follow the provider’s instructions about what is useful.' },
  { id: 'informant', title: 'Check whether information from someone who knows you is requested', text: 'Only arrange this if the assessment provider asks for it or explains why it is relevant.' },
  { id: 'questions', title: 'Write down the questions you want answered', text: 'For example: when the report is issued, what happens next and how follow-up works.' },
  { id: 'adjustments', title: 'Plan any practical adjustments you need', text: 'Think about communication, breaks, accessibility, technology or environment and contact the provider if needed.' },
] as const;

export default function AssessmentPrepScreen() {
  const [prep, setPrep] = useState<PrepState>({ checked: [], questions: '' });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as PrepState;
        setPrep({
          checked: Array.isArray(parsed.checked) ? parsed.checked : [],
          questions: typeof parsed.questions === 'string' ? parsed.questions : '',
        });
      })
      .catch(() => {});
  }, []);

  const progress = useMemo(() => Math.round((prep.checked.length / ITEMS.length) * 100), [prep.checked]);

  const persist = async (next: PrepState) => {
    setPrep(next);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const toggle = (id: string) => {
    const checked = prep.checked.includes(id)
      ? prep.checked.filter(item => item !== id)
      : [...prep.checked, id];
    persist({ ...prep, checked });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>ASSESSMENT PREP</Text>
        <Text style={styles.title}>Prepare the practical stuff. Do not rehearse a diagnosis.</Text>
        <Text style={styles.subtitle}>This workspace reduces memory and organisation load before an assessment while deliberately avoiding symptom scripts or coached answers.</Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressLabel}>YOUR PREPARATION</Text>
            <Text style={styles.progressTitle}>{prep.checked.length} of {ITEMS.length} practical checks</Text>
          </View>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
        <View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
      </View>

      <View style={styles.section}>
        {ITEMS.map((item, index) => {
          const checked = prep.checked.includes(item.id);
          return (
            <TouchableOpacity key={item.id} style={[styles.row, checked && styles.rowDone]} onPress={() => toggle(item.id)} accessibilityRole="checkbox" accessibilityState={{ checked }}>
              <View style={[styles.box, checked && styles.boxDone]}><Text style={styles.boxText}>{checked ? '✓' : index + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, checked && styles.rowTitleDone]}>{item.title}</Text>
                <Text style={styles.rowText}>{item.text}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionKicker}>MY QUESTIONS</Text>
        <Text style={styles.sectionTitle}>What do I want to remember to ask?</Text>
        <Text style={styles.help}>Use this as a memory aid for your own genuine questions.</Text>
        <TextInput
          style={styles.input}
          multiline
          textAlignVertical="top"
          placeholder="Example: When should I expect the report? What happens after the assessment?"
          placeholderTextColor={colors.textMuted}
          value={prep.questions}
          onChangeText={questions => setPrep({ ...prep, questions })}
          onBlur={() => persist(prep)}
        />
        <TouchableOpacity style={styles.saveButton} onPress={() => persist(prep)}><Text style={styles.saveText}>Save on this device</Text></TouchableOpacity>
      </View>

      <View style={styles.boundary}>
        <Text style={styles.boundaryLabel}>IMPORTANT BOUNDARY</Text>
        <Text style={styles.boundaryText}>An ADHD assessment should reflect your real history and current difficulties. Different Minds is designed not to provide scripts, exaggeration prompts or coached answers for obtaining a diagnosis.</Text>
      </View>

      <Text style={styles.footer}>General organisation support only. Confirm assessment requirements directly with your healthcare provider.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 3 },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 24, padding: spacing.lg, borderWidth: 1, borderColor: colors.primary, marginBottom: spacing.md },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 7 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  progressCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  progressTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: 4 },
  progressValue: { color: colors.accent, fontSize: 18, fontWeight: '900' },
  track: { height: 9, backgroundColor: colors.bg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 12 },
  fill: { height: '100%', backgroundColor: colors.accent },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 11, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  rowDone: { backgroundColor: colors.surfaceAlt, borderColor: colors.primary },
  box: { width: 30, height: 30, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 11, backgroundColor: colors.surface },
  boxDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  boxText: { color: '#0F1220', fontSize: 11, fontWeight: '900' },
  rowTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  rowTitleDone: { color: colors.accent },
  rowText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  sectionKicker: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 5 },
  help: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 5, marginBottom: 10 },
  input: { minHeight: 130, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12, color: colors.text, fontSize: 12, lineHeight: 18 },
  saveButton: { minHeight: 46, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  saveText: { color: '#0F1220', fontSize: 12, fontWeight: '900' },
  boundary: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 13, borderWidth: 1, borderColor: '#F7B267', marginBottom: spacing.md },
  boundaryLabel: { color: '#F7B267', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  boundaryText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 5 },
  footer: { color: colors.textMuted, fontSize: 9, lineHeight: 14, textAlign: 'center', paddingHorizontal: spacing.sm },
});
