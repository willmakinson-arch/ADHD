import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

const STORAGE_KEY = 'different-minds:evidence-organiser:v1';

type NoteField = 'dates' | 'school' | 'work' | 'daily' | 'support' | 'remember';
type ChecklistId = 'referral' | 'appointments' | 'school_records' | 'previous_letters' | 'medication_list' | 'work_letters' | 'provider_info';

type SavedState = {
  notes: Record<NoteField, string>;
  checklist: Record<ChecklistId, boolean>;
};

const EMPTY_NOTES: Record<NoteField, string> = {
  dates: '',
  school: '',
  work: '',
  daily: '',
  support: '',
  remember: '',
};

const EMPTY_CHECKLIST: Record<ChecklistId, boolean> = {
  referral: false,
  appointments: false,
  school_records: false,
  previous_letters: false,
  medication_list: false,
  work_letters: false,
  provider_info: false,
};

const CHECKLIST: { id: ChecklistId; title: string; text: string }[] = [
  { id: 'referral', title: 'Referral / GP letters', text: 'Keep copies of referral requests, acknowledgements or letters you already have.' },
  { id: 'appointments', title: 'Appointment letters', text: 'Assessment, follow-up or titration appointment details.' },
  { id: 'school_records', title: 'School records you already have', text: 'Reports or records you personally want to keep together. Different Minds does not tell you what they must show.' },
  { id: 'previous_letters', title: 'Previous clinical letters', text: 'Existing assessment, mental-health or other relevant healthcare correspondence.' },
  { id: 'medication_list', title: 'Current medication list', text: 'An up-to-date factual list for your own reference — not medication advice.' },
  { id: 'work_letters', title: 'Work / occupational-health letters', text: 'Any workplace support or occupational-health information you want organised.' },
  { id: 'provider_info', title: 'Provider information', text: 'Current contact details, quotes, fee information or pathway notes you have checked.' },
];

const NOTE_SECTIONS: { id: NoteField; title: string; prompt: string; placeholder: string }[] = [
  { id: 'dates', title: 'Important dates', prompt: 'Dates you do not want to lose track of.', placeholder: 'e.g. GP appointment, referral sent, provider acknowledgement, assessment date' },
  { id: 'school', title: 'School / early-life notes', prompt: 'Factual memories or records you personally want to remember.', placeholder: 'Write in your own words. You do not need to match any diagnostic criteria here.' },
  { id: 'work', title: 'Work / education history', prompt: 'Jobs, courses, support or practical events you may want to remember later.', placeholder: 'Keep this factual and relevant to what you want to discuss.' },
  { id: 'daily', title: 'Everyday-life notes', prompt: 'Real situations you want to remember for your own conversations.', placeholder: 'Your own examples, not suggested symptoms or coached answers.' },
  { id: 'support', title: 'Support tried before', prompt: 'Things you have already tried, requested or found useful.', placeholder: 'e.g. reminders, workplace changes, coaching, counselling, routines' },
  { id: 'remember', title: 'Things I want to remember to ask', prompt: 'Questions or topics for a GP, provider, employer or appointment.', placeholder: 'Add anything you are worried you will forget in the moment.' },
];

export default function EvidenceOrganiserScreen() {
  const [notes, setNotes] = useState<Record<NoteField, string>>(EMPTY_NOTES);
  const [checklist, setChecklist] = useState<Record<ChecklistId, boolean>>(EMPTY_CHECKLIST);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<SavedState>;
        if (saved.notes) setNotes({ ...EMPTY_NOTES, ...saved.notes });
        if (saved.checklist) setChecklist({ ...EMPTY_CHECKLIST, ...saved.checklist });
      } catch {
        // Local storage is optional; the organiser still works in-session.
      }
    };
    load();
  }, []);

  const completedDocs = useMemo(() => Object.values(checklist).filter(Boolean).length, [checklist]);
  const completedNotes = useMemo(() => Object.values(notes).filter(value => value.trim().length > 0).length, [notes]);

  const persist = async (nextNotes = notes, nextChecklist = checklist) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ notes: nextNotes, checklist: nextChecklist } satisfies SavedState));
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSavedAt(null);
    }
  };

  const updateNote = (id: NoteField, value: string) => {
    const next = { ...notes, [id]: value };
    setNotes(next);
    persist(next, checklist);
  };

  const toggleChecklist = (id: ChecklistId) => {
    const next = { ...checklist, [id]: !checklist[id] };
    setChecklist(next);
    persist(notes, next);
  };

  const clearAll = async () => {
    setNotes(EMPTY_NOTES);
    setChecklist(EMPTY_CHECKLIST);
    setSavedAt(null);
    try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.kicker}>MY NOTES & EVIDENCE</Text>
        <Text style={styles.title}>Keep the important pieces together without trying to remember everything at once.</Text>
        <Text style={styles.subtitle}>This is a private memory and organisation space. It does not score symptoms, decide whether you have ADHD or tell you what evidence should say.</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressPill}><Text style={styles.progressNumber}>{completedNotes}</Text><Text style={styles.progressLabel}>note areas used</Text></View>
          <View style={styles.progressPill}><Text style={styles.progressNumber}>{completedDocs}</Text><Text style={styles.progressLabel}>items organised</Text></View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionKicker}>DOCUMENT CHECKLIST</Text>
        <Text style={styles.sectionTitle}>Things you may want to keep together</Text>
        <Text style={styles.sectionHelp}>Only tick items that are relevant to you. This is an organiser, not a list of documents that every assessment requires.</Text>
        {CHECKLIST.map(item => (
          <TouchableOpacity key={item.id} style={[styles.checkRow, checklist[item.id] && styles.checkRowActive]} onPress={() => toggleChecklist(item.id)}>
            <View style={[styles.checkbox, checklist[item.id] && styles.checkboxActive]}><Text style={styles.checkmark}>{checklist[item.id] ? '✓' : ''}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkTitle}>{item.title}</Text>
              <Text style={styles.checkText}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.notesHeading}>Your own notes</Text>
      {NOTE_SECTIONS.map(section => (
        <View key={section.id} style={styles.noteCard}>
          <Text style={styles.noteTitle}>{section.title}</Text>
          <Text style={styles.notePrompt}>{section.prompt}</Text>
          <TextInput
            style={styles.noteInput}
            value={notes[section.id]}
            onChangeText={value => updateNote(section.id, value)}
            multiline
            textAlignVertical="top"
            placeholder={section.placeholder}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      ))}

      <View style={styles.localCard}>
        <Text style={styles.localTitle}>Local in this phase</Text>
        <Text style={styles.localText}>These notes are stored on this device using local app storage. They are not uploaded to a Different Minds backend by this feature.</Text>
        {savedAt && <Text style={styles.savedText}>Last local save: {savedAt}</Text>}
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={clearAll}><Text style={styles.clearText}>Clear all local notes and ticks</Text></TouchableOpacity>
      <Text style={styles.footer}>Use your own words. For assessment requirements or clinical advice, check directly with the healthcare provider involved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 4, width: '100%', maxWidth: 980, alignSelf: 'center' },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 26, borderWidth: 1, borderColor: colors.primary, padding: spacing.lg, marginBottom: spacing.md },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 25, lineHeight: 31, fontWeight: '900', marginTop: 7 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  progressPill: { backgroundColor: colors.bg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressNumber: { color: colors.accent, fontSize: 13, fontWeight: '900' },
  progressLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  sectionCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.lg },
  sectionKicker: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 5 },
  sectionHelp: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 5, marginBottom: 10 },
  checkRow: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: 7 },
  checkRowActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.primary },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#0F1220', fontSize: 13, fontWeight: '900' },
  checkTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
  checkText: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  notesHeading: { color: colors.text, fontSize: 19, fontWeight: '900', marginBottom: spacing.sm, marginLeft: 2 },
  noteCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  noteTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  notePrompt: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4, marginBottom: 9 },
  noteInput: { minHeight: 105, backgroundColor: colors.bg, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 12, lineHeight: 18 },
  localCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, padding: 13, marginTop: spacing.sm },
  localTitle: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  localText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  savedText: { color: colors.text, fontSize: 9, fontWeight: '700', marginTop: 7 },
  clearButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  clearText: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },
  footer: { color: colors.textMuted, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.sm },
});
