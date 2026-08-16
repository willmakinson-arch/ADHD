import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

const STORAGE_KEY = 'different-minds:referral-progress:v1';

const MILESTONES = [
  {
    id: 'preparing',
    title: 'Preparing to ask for help',
    description: 'Gather the key examples and questions you want to discuss.',
    next: 'Book or prepare for a GP/healthcare-professional conversation.',
  },
  {
    id: 'gp',
    title: 'GP / healthcare conversation',
    description: 'Discuss your concerns and the assessment route that applies to you.',
    next: 'Confirm what referral or next step has actually been agreed.',
  },
  {
    id: 'referral_sent',
    title: 'Referral or request sent',
    description: 'Keep the date, route, provider and any reference information together.',
    next: 'Confirm the receiving service has the referral rather than assuming it arrived.',
  },
  {
    id: 'provider_confirmed',
    title: 'Provider / service confirmed receipt',
    description: 'You have confirmation that the referral or request has reached the service.',
    next: 'Record any expected contact window and check what happens while you wait.',
  },
  {
    id: 'waiting',
    title: 'Waiting for assessment',
    description: 'Keep contact details, updates and changes to your circumstances in one place.',
    next: 'Use current provider information for updates; do not rely on an old waiting-time estimate.',
  },
  {
    id: 'assessment_booked',
    title: 'Assessment booked',
    description: 'Date, time, location/video link and requested forms are confirmed.',
    next: 'Add the appointment reminder and prepare the information the provider actually requested.',
  },
  {
    id: 'assessment_complete',
    title: 'Assessment completed',
    description: 'The assessment has taken place and you are waiting for or have received the outcome.',
    next: 'Keep the outcome/report and ask the provider to explain the follow-up plan clearly.',
  },
  {
    id: 'follow_up',
    title: 'Follow-up and ongoing support',
    description: 'Treatment, workplace/study support or other follow-up is now the focus.',
    next: 'Track follow-up appointments and the practical support actions that matter to you.',
  },
] as const;

export default function ProgressScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          const parsed = Number(saved);
          if (Number.isInteger(parsed) && parsed >= 0 && parsed < MILESTONES.length) {
            setCurrentIndex(parsed);
          }
        }
      } catch {
        // Keep default state if local storage is unavailable.
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  const current = MILESTONES[currentIndex];
  const progress = useMemo(
    () => Math.round(((currentIndex + 1) / MILESTONES.length) * 100),
    [currentIndex]
  );

  const chooseMilestone = async (index: number) => {
    setCurrentIndex(index);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(index));
    } catch {
      // Timeline still works for this session if persistence is unavailable.
    }
  };

  const goToUsefulTool = () => {
    if (current.id === 'preparing' || current.id === 'gp') {
      navigation.navigate('Home');
      return;
    }
    if (current.id === 'assessment_booked' || current.id === 'assessment_complete' || current.id === 'follow_up') {
      navigation.navigate('Appointments');
      return;
    }
    navigation.navigate('Clinics');
  };

  const toolLabel =
    current.id === 'assessment_booked' || current.id === 'assessment_complete' || current.id === 'follow_up'
      ? 'Open appointments'
      : current.id === 'preparing' || current.id === 'gp'
      ? 'Open My Journey'
      : 'Open provider tools';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>YOUR ADHD JOURNEY</Text>
        <Text style={styles.title}>Referral & assessment timeline</Text>
        <Text style={styles.subtitle}>
          Tell Different Minds where you are up to. It remembers on this device and turns the process into a visible sequence instead of a pile of messages and dates.
        </Text>

        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>CURRENT PROGRESS</Text>
          <Text style={styles.progressValue}>{loaded ? `${progress}%` : '—'}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: loaded ? `${progress}%` : '0%' }]} />
        </View>
      </View>

      <View style={styles.nowCard}>
        <Text style={styles.nowKicker}>YOU ARE HERE</Text>
        <Text style={styles.nowTitle}>{current.title}</Text>
        <Text style={styles.nowBody}>{current.description}</Text>
        <View style={styles.nextBox}>
          <Text style={styles.nextLabel}>ONE CLEAR NEXT STEP</Text>
          <Text style={styles.nextText}>{current.next}</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={goToUsefulTool}>
          <Text style={styles.primaryButtonText}>{toolLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.timelineHeading}>Tap the stage that best matches where you are now</Text>
        <Text style={styles.timelineHelp}>
          This is your own progress marker. It does not contact a GP, provider or NHS service and does not claim that a referral has happened unless you mark it yourself.
        </Text>

        {MILESTONES.map((milestone, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <TouchableOpacity
              key={milestone.id}
              style={[styles.milestoneRow, active && styles.milestoneRowActive]}
              onPress={() => chooseMilestone(index)}
            >
              <View style={styles.timelineRail}>
                <View
                  style={[
                    styles.milestoneDot,
                    completed && styles.milestoneDotComplete,
                    active && styles.milestoneDotActive,
                  ]}
                >
                  <Text style={styles.milestoneDotText}>{completed ? '✓' : index + 1}</Text>
                </View>
                {index < MILESTONES.length - 1 && (
                  <View style={[styles.railLine, completed && styles.railLineComplete]} />
                )}
              </View>

              <View style={styles.milestoneCopy}>
                <View style={styles.milestoneTitleRow}>
                  <Text style={[styles.milestoneTitle, active && styles.milestoneTitleActive]}>
                    {milestone.title}
                  </Text>
                  {active && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Private by default</Text>
        <Text style={styles.privacyText}>
          Your selected timeline stage is stored locally on this device. Different Minds does not need an account or backend to remember this progress in Phase 1.
        </Text>
      </View>

      <Text style={styles.footerNote}>
        This timeline is an organisation tool, not proof of referral status. Always confirm important referral and appointment information with the relevant healthcare service.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  heroCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  title: { color: colors.text, fontSize: 24, lineHeight: 29, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  progressLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  progressValue: { color: colors.accent, fontSize: 13, fontWeight: '900' },
  progressTrack: {
    height: 8,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: radius.pill },
  nowCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  nowKicker: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  nowTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 5 },
  nowBody: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  nextBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 12,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  nextLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  nextText: { color: colors.text, fontSize: 12, lineHeight: 18, marginTop: 4, fontWeight: '700' },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryButtonText: { color: colors.text, fontSize: 13, fontWeight: '900' },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  timelineHeading: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '900' },
  timelineHelp: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 5, marginBottom: 10 },
  milestoneRow: {
    flexDirection: 'row',
    borderRadius: radius.md,
    paddingRight: 8,
    marginBottom: 2,
  },
  milestoneRowActive: { backgroundColor: colors.surfaceAlt },
  timelineRail: { width: 38, alignItems: 'center' },
  milestoneDot: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 11,
    zIndex: 1,
  },
  milestoneDotComplete: { backgroundColor: colors.primaryDark, borderColor: colors.primary },
  milestoneDotActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  milestoneDotText: { color: colors.text, fontSize: 10, fontWeight: '900' },
  railLine: {
    width: 2,
    flex: 1,
    minHeight: 50,
    backgroundColor: colors.border,
  },
  railLineComplete: { backgroundColor: colors.primary },
  milestoneCopy: { flex: 1, paddingVertical: 11 },
  milestoneTitleRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  milestoneTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', flexShrink: 1 },
  milestoneTitleActive: { color: colors.text, fontWeight: '900' },
  milestoneDescription: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  currentBadge: {
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  currentBadgeText: { color: colors.accent, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  privacyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  privacyText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  footerNote: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});
