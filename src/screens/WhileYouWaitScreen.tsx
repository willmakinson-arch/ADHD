import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

type TargetPage = 'communication' | 'providers' | 'prep' | 'support' | 'evidence' | 'progress' | 'appointments';
type NeedId = 'referral' | 'provider' | 'assessment' | 'work' | 'head' | 'progress' | 'appointment';

const STORAGE_KEY = 'different-minds:while-you-wait:v1';

const NEEDS: {
  id: NeedId;
  title: string;
  text: string;
  actionTitle: string;
  actionText: string;
  button: string;
  target: TargetPage;
  symbol: string;
}[] = [
  {
    id: 'referral',
    title: 'I need to chase something',
    text: 'You are waiting for an update and do not know what to write or ask.',
    actionTitle: 'Do one follow-up, then stop checking for today.',
    actionText: 'Use the Communication Assistant to prepare a short factual message asking for the current position and next step.',
    button: 'Draft my follow-up',
    target: 'communication',
    symbol: '✉',
  },
  {
    id: 'provider',
    title: 'I am stuck choosing a provider',
    text: 'Prices, waits and treatment pathways are starting to blur together.',
    actionTitle: 'Compare only the providers you are genuinely considering.',
    actionText: 'Save up to three and check the pathway questions that matter before you make a decision.',
    button: 'Open Provider Intelligence',
    target: 'providers',
    symbol: '⇄',
  },
  {
    id: 'assessment',
    title: 'My assessment is coming up',
    text: 'You are worried you will forget something important on the day.',
    actionTitle: 'Prepare the practical things, not perfect answers.',
    actionText: 'Use the checklist and save the questions you want to remember. Different Minds will not coach symptoms or tell you what to say.',
    button: 'Open Assessment Prep',
    target: 'prep',
    symbol: '◎',
  },
  {
    id: 'work',
    title: 'Work is the problem today',
    text: 'You need to understand support or start a workplace conversation.',
    actionTitle: 'Name the barrier before trying to solve everything.',
    actionText: 'Support Finder can point you to the correct UK route for workplace support and adjustments.',
    button: 'Open Support Finder',
    target: 'support',
    symbol: '+',
  },
  {
    id: 'head',
    title: 'There is too much in my head',
    text: 'Dates, memories, questions and documents are all competing for attention.',
    actionTitle: 'Move one thing out of your head and into the app.',
    actionText: 'Write one date, one note or tick one document. You do not need to complete the whole organiser.',
    button: 'Open My Notes & Evidence',
    target: 'evidence',
    symbol: '▤',
  },
  {
    id: 'progress',
    title: 'I have lost track of where I am',
    text: 'You cannot remember what has happened or what stage comes next.',
    actionTitle: 'Update your current stage — nothing more.',
    actionText: 'My Progress keeps the referral and assessment milestones in one simple timeline on this device.',
    button: 'Open My Progress',
    target: 'progress',
    symbol: '✓',
  },
  {
    id: 'appointment',
    title: 'I just need to remember the date',
    text: 'You have an appointment or important date you do not want to miss.',
    actionTitle: 'Put the date somewhere reliable now.',
    actionText: 'Save the appointment in Different Minds so it is not another thing you have to keep in working memory.',
    button: 'Open Appointments',
    target: 'appointments',
    symbol: '●',
  },
];

export default function WhileYouWaitScreen({ onOpen }: { onOpen: (page: TargetPage) => void }) {
  const [selectedId, setSelectedId] = useState<NeedId>('referral');
  const [doneToday, setDoneToday] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as { selectedId?: NeedId; doneDate?: string };
        if (saved.selectedId && NEEDS.some(item => item.id === saved.selectedId)) setSelectedId(saved.selectedId);
        if (saved.doneDate === new Date().toISOString().slice(0, 10)) setDoneToday(true);
      } catch {}
    };
    load();
  }, []);

  const selected = useMemo(() => NEEDS.find(item => item.id === selectedId) ?? NEEDS[0], [selectedId]);

  const choose = async (id: NeedId) => {
    setSelectedId(id);
    setDoneToday(false);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedId: id })); } catch {}
  };

  const markDone = async () => {
    const next = !doneToday;
    setDoneToday(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedId,
        doneDate: next ? new Date().toISOString().slice(0, 10) : undefined,
      }));
    } catch {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>WHILE YOU WAIT</Text>
        <Text style={styles.title}>You do not need to sort the whole ADHD journey today.</Text>
        <Text style={styles.subtitle}>Pick the thing that is taking up the most headspace right now. Different Minds will reduce it to one useful action.</Text>
      </View>

      <View style={styles.ruleCard}>
        <Text style={styles.ruleNumber}>1</Text>
        <View style={{ flex: 1 }}><Text style={styles.ruleTitle}>Choose one problem</Text><Text style={styles.ruleText}>Not the whole list. Just the one that matters today.</Text></View>
        <Text style={styles.ruleArrow}>→</Text>
        <Text style={styles.ruleNumber}>1</Text>
        <View style={{ flex: 1 }}><Text style={styles.ruleTitle}>Do one action</Text><Text style={styles.ruleText}>Then you are allowed to stop.</Text></View>
      </View>

      <Text style={styles.sectionTitle}>What is taking up the most headspace?</Text>
      <View style={styles.needGrid}>
        {NEEDS.map(item => (
          <TouchableOpacity key={item.id} style={[styles.needCard, selectedId === item.id && styles.needCardActive]} onPress={() => choose(item.id)}>
            <View style={[styles.needIcon, selectedId === item.id && styles.needIconActive]}><Text style={styles.needSymbol}>{item.symbol}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.needTitle, selectedId === item.id && styles.needTitleActive]}>{item.title}</Text>
              <Text style={styles.needText}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionKicker}>YOUR ONE THING</Text>
        <Text style={styles.actionTitle}>{selected.actionTitle}</Text>
        <Text style={styles.actionText}>{selected.actionText}</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => onOpen(selected.target)}><Text style={styles.actionButtonText}>{selected.button}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.doneButton, doneToday && styles.doneButtonActive]} onPress={markDone}>
          <Text style={[styles.doneText, doneToday && styles.doneTextActive]}>{doneToday ? '✓ Done for today' : 'Mark my one thing as done'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.waitCard}>
        <Text style={styles.waitTitle}>Waiting is still part of the process</Text>
        <Text style={styles.waitText}>This area is designed to reduce repeated checking and mental load. It does not estimate when a provider will contact you or invent progress that has not been confirmed.</Text>
      </View>

      <Text style={styles.footer}>If something changes, update My Progress or your appointment details. Otherwise, one useful action is enough for today.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 4, width: '100%', maxWidth: 980, alignSelf: 'center' },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 26, borderWidth: 1, borderColor: colors.accent, padding: spacing.lg, marginBottom: spacing.md },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 26, lineHeight: 32, fontWeight: '900', marginTop: 7 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  ruleCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9 },
  ruleNumber: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accent, color: '#0F1220', textAlign: 'center', lineHeight: 30, fontSize: 14, fontWeight: '900' },
  ruleTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
  ruleText: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 2 },
  ruleArrow: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: spacing.sm, marginLeft: 2 },
  needGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  needCard: { flexGrow: 1, flexBasis: 300, minHeight: 95, flexDirection: 'row', gap: 11, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 13 },
  needCardActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.primary },
  needIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  needIconActive: { backgroundColor: colors.accent },
  needSymbol: { color: '#0F1220', fontSize: 16, fontWeight: '900' },
  needTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '900' },
  needTitleActive: { color: colors.text },
  needText: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  actionCard: { backgroundColor: colors.surfaceAlt, borderRadius: 24, borderWidth: 1, borderColor: colors.accent, padding: spacing.lg, marginBottom: spacing.md },
  actionKicker: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  actionTitle: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: '900', marginTop: 6 },
  actionText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  actionButton: { minHeight: 50, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, paddingHorizontal: 12 },
  actionButtonText: { color: '#0F1220', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  doneButton: { minHeight: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  doneButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  doneText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  doneTextActive: { color: '#0F1220', fontWeight: '900' },
  waitCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 13 },
  waitTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  waitText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  footer: { color: colors.textMuted, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.sm },
});
