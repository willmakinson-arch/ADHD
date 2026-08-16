import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Logo from '../components/Logo';
import { JOURNEY_STAGES } from '../data/journey';
import { getComparedProviderIds } from '../data/providerIntelligence';
import { useLocation } from '../context/LocationContext';
import { colors, radius, spacing } from '../theme/theme';

const JOURNEY_STAGE_KEY = 'different-minds:journey:stage:v1';
const PROGRESS_KEY = 'different-minds:referral-progress:v1';
const WAIT_KEY = 'different-minds:while-you-wait:v1';

const PROGRESS_LABELS = [
  'Preparing to ask for help',
  'GP / healthcare conversation',
  'Referral or request sent',
  'Provider confirmed receipt',
  'Waiting for assessment',
  'Assessment booked',
  'Assessment completed',
  'Follow-up and ongoing support',
];

type TodayAction = {
  eyebrow: string;
  title: string;
  text: string;
  button: string;
  page: string;
  reason: string;
};

export default function HomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const { status } = useLocation();
  const locationReady = status === 'granted';

  const [journeyLabel, setJourneyLabel] = useState('Not set yet');
  const [progressIndex, setProgressIndex] = useState(0);
  const [providerCount, setProviderCount] = useState(0);
  const [oneThingDone, setOneThingDone] = useState(false);

  const openMore = (open: string) => navigation.navigate('More', { open, request: Date.now() });

  useFocusEffect(useCallback(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [stageRaw, progressRaw, waitingRaw, providerIds] = await Promise.all([
          AsyncStorage.getItem(JOURNEY_STAGE_KEY),
          AsyncStorage.getItem(PROGRESS_KEY),
          AsyncStorage.getItem(WAIT_KEY),
          getComparedProviderIds(),
        ]);

        if (!active) return;

        const stage = JOURNEY_STAGES.find(item => item.id === stageRaw);
        setJourneyLabel(stage?.label ?? 'Not set yet');

        const parsedProgress = Number(progressRaw ?? 0);
        setProgressIndex(
          Number.isInteger(parsedProgress) && parsedProgress >= 0 && parsedProgress < PROGRESS_LABELS.length
            ? parsedProgress
            : 0,
        );
        setProviderCount(providerIds.length);

        if (waitingRaw) {
          try {
            const waiting = JSON.parse(waitingRaw) as { doneDate?: string };
            setOneThingDone(waiting.doneDate === new Date().toISOString().slice(0, 10));
          } catch {
            setOneThingDone(false);
          }
        } else {
          setOneThingDone(false);
        }
      } catch {
        // Dashboard falls back to safe local defaults.
      }
    };

    loadDashboard();
    return () => { active = false; };
  }, []));

  const todayAction = useMemo<TodayAction>(() => {
    if (journeyLabel === 'Not set yet') {
      return {
        eyebrow: 'TODAY · START HERE',
        title: 'First, work out which route actually fits you',
        text: 'Choose your UK nation and where you are in the ADHD journey. Different Minds will reduce the process to one useful next step.',
        button: 'Find My Route',
        page: 'journey',
        reason: 'Your route has not been set yet',
      };
    }

    if (progressIndex === 0) {
      return {
        eyebrow: 'TODAY · GET CLEAR',
        title: 'Turn “I need help” into a clear starting point',
        text: 'Use Find My Route to see which assessment pathway applies and what to prepare before the first healthcare conversation.',
        button: 'Show my next step',
        page: 'journey',
        reason: PROGRESS_LABELS[progressIndex],
      };
    }

    if (progressIndex === 1) {
      return {
        eyebrow: 'TODAY · PREPARE THE CONVERSATION',
        title: 'Make the next healthcare conversation easier to start',
        text: 'Check your route, keep the facts you want to remember together and use the existing GP-letter tool where Right to Choose is relevant.',
        button: 'Review my route',
        page: 'journey',
        reason: PROGRESS_LABELS[progressIndex],
      };
    }

    if (progressIndex === 2) {
      return {
        eyebrow: 'TODAY · CLOSE THE LOOP',
        title: 'Confirm that your referral or request actually arrived',
        text: 'Do not carry the uncertainty around in your head. Different Minds can help you draft a short follow-up asking for receipt and the next step.',
        button: 'Draft the follow-up',
        page: 'communication',
        reason: PROGRESS_LABELS[progressIndex],
      };
    }

    if (progressIndex === 3) {
      return {
        eyebrow: 'TODAY · KNOW WHAT HAPPENS NEXT',
        title: 'Confirm the provider’s current contact and waiting plan',
        text: 'If the referral is safely with the provider, the useful question becomes what happens next and when you should expect to hear from them.',
        button: 'Prepare a provider message',
        page: 'communication',
        reason: PROGRESS_LABELS[progressIndex],
      };
    }

    if (progressIndex === 4) {
      return {
        eyebrow: oneThingDone ? 'TODAY · DONE IS ENOUGH' : 'TODAY · ONE THING ONLY',
        title: oneThingDone ? 'You have already done your useful action today' : 'Do one useful thing, then put the process down',
        text: oneThingDone
          ? 'Different Minds has marked today’s action as done. Unless something has actually changed, you do not need to keep checking.'
          : 'Choose the one part of the wait taking up the most headspace. Different Minds will reduce it to one small action.',
        button: oneThingDone ? 'View today’s action' : 'Choose my one thing',
        page: 'waiting',
        reason: PROGRESS_LABELS[progressIndex],
      };
    }

    if (progressIndex === 5) {
      return {
        eyebrow: 'TODAY · GET READY, NOT REHEARSED',
        title: 'Prepare the practical things you do not want to forget',
        text: 'Use the assessment checklist, keep requested information together and save your own questions without coached answers or symptom rehearsal.',
        button: 'Open Assessment Prep',
        page: 'prep',
        reason: PROGRESS_LABELS[progressIndex],
      };
    }

    if (progressIndex === 6) {
      return {
        eyebrow: 'TODAY · UNDERSTAND THE FOLLOW-UP',
        title: 'Make sure you understand what happens after the assessment',
        text: 'Keep the outcome, report and follow-up information organised, then identify any practical questions you still need the provider to answer.',
        button: 'Open My Progress',
        page: 'progress',
        reason: PROGRESS_LABELS[progressIndex],
      };
    }

    return {
      eyebrow: 'TODAY · SUPPORT THAT FITS YOUR LIFE',
      title: 'Work out which practical support matters next',
      text: 'Use Support Finder for the correct UK work, workplace-adjustment and disability-support routes rather than trying to piece them together yourself.',
      button: 'Open Support Finder',
      page: 'support',
      reason: PROGRESS_LABELS[progressIndex],
    };
  }, [journeyLabel, progressIndex, oneThingDone]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, compact && styles.contentCompact]}>
      <View style={[styles.hero, compact && styles.heroCompact]}>
        <View style={styles.brandRow}>
          <View style={[styles.logoCard, compact && styles.logoCardCompact]}><Logo size={compact ? 48 : 62} /></View>
          <View style={styles.brandCopy}>
            <Text style={styles.kicker}>ADHD SUPPORT & GUIDANCE</Text>
            <Text style={[styles.appName, compact && styles.appNameCompact]}>Different Minds</Text>
            <Text style={styles.subGreeting}>A clearer route through assessment and care.</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: locationReady ? colors.success : colors.textMuted }]} />
          <Text style={styles.statusText}>{locationReady ? 'Location ready for nearby clinics' : 'Search clinics by town or postcode'}</Text>
        </View>
      </View>

      <Text style={styles.dashboardHeading}>Your journey at a glance</Text>

      {compact ? (
        <View style={styles.snapshotCard}>
          <SnapshotRow label="Your route" value={journeyLabel} action="Change" onPress={() => openMore('journey')} />
          <View style={styles.snapshotDivider} />
          <SnapshotRow label="Your progress" value={PROGRESS_LABELS[progressIndex]} action="Update" onPress={() => openMore('progress')} />
          <View style={styles.snapshotDivider} />
          <SnapshotRow label="Providers saved" value={`${providerCount}`} action={providerCount ? 'Compare' : 'Add'} onPress={() => openMore('providers')} />
        </View>
      ) : (
        <View style={styles.dashboardRow}>
          <TouchableOpacity style={styles.statusCard} onPress={() => openMore('journey')}>
            <Text style={styles.statusCardLabel}>YOUR ROUTE</Text>
            <Text style={styles.statusCardValue}>{journeyLabel}</Text>
            <Text style={styles.statusCardLink}>Change route →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statusCard} onPress={() => openMore('progress')}>
            <Text style={styles.statusCardLabel}>YOUR PROGRESS</Text>
            <Text style={styles.statusCardValue}>{PROGRESS_LABELS[progressIndex]}</Text>
            <Text style={styles.statusCardLink}>Update stage →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statusCard} onPress={() => openMore('providers')}>
            <Text style={styles.statusCardLabel}>PROVIDERS SAVED</Text>
            <Text style={styles.providerNumber}>{providerCount}</Text>
            <Text style={styles.statusCardLink}>{providerCount ? 'Compare them →' : 'Build comparison →'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={[styles.todayCard, compact && styles.todayCardCompact]} onPress={() => openMore(todayAction.page)} activeOpacity={0.9}>
        <View style={styles.todayTopRow}>
          <View>
            <Text style={styles.todayEyebrow}>{todayAction.eyebrow}</Text>
            <Text style={styles.todayReason}>Based on: {todayAction.reason}</Text>
          </View>
          <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>1 NEXT STEP</Text></View>
        </View>
        <Text style={[styles.todayTitle, compact && styles.todayTitleCompact]}>{todayAction.title}</Text>
        <Text style={styles.todayText}>{todayAction.text}</Text>
        <View style={styles.todayButton}>
          <Text style={styles.todayButtonText}>{todayAction.button}</Text>
          <Text style={styles.todayButtonArrow}>→</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tools that reduce the mental load</Text>
      <View style={styles.quickGrid}>
        <QuickCard compact={compact} symbol="1" title="While You Wait" text="One problem. One useful action." onPress={() => openMore('waiting')} />
        <QuickCard compact={compact} symbol="✉" title="Communication" text="Draft it, review it, then decide whether to send." onPress={() => openMore('communication')} />
        <QuickCard compact={compact} symbol="▤" title="Notes & Evidence" text="Get dates, history and questions out of your head." onPress={() => openMore('evidence')} />
        <QuickCard compact={compact} symbol="+" title="Support Finder" text="Work, adjustments and UK-specific support routes." onPress={() => openMore('support')} />
      </View>

      <Text style={styles.sectionTitle}>Assessment routes & tools</Text>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RTC')} activeOpacity={0.9}>
        <View style={styles.cardIcon}><Text style={styles.cardIconText}>R</Text></View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>Right to Choose clinics</Text>
          <Text style={styles.cardText}>Explore NHS-funded assessment routes for England and add providers to compare</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Private')} activeOpacity={0.9}>
        <View style={[styles.cardIcon, styles.privateIcon]}><Text style={styles.cardIconText}>P</Text></View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>Private ADHD clinics</Text>
          <Text style={styles.cardText}>Compare nearby or online private options, then verify the full pathway</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Letter')} activeOpacity={0.9}>
        <View style={[styles.cardIcon, styles.letterIcon]}><Text style={styles.cardIconText}>✎</Text></View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>Build your GP letter</Text>
          <Text style={styles.cardText}>Create a Right to Choose request to review with your GP</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => openMore('appointments')} activeOpacity={0.9}>
        <View style={[styles.cardIcon, styles.diaryIcon]}><Text style={styles.cardIconText}>●</Text></View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>Your appointments</Text>
          <Text style={styles.cardText}>Keep dates and reminders together</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.noticeText}>General information and organisation support only — not a diagnosis. Always confirm important healthcare information with your GP or provider.</Text>
    </ScrollView>
  );
}

function SnapshotRow({ label, value, action, onPress }: { label: string; value: string; action: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.snapshotRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.snapshotCopy}>
        <Text style={styles.snapshotLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.snapshotValue}>{value}</Text>
      </View>
      <Text style={styles.snapshotAction}>{action} →</Text>
    </TouchableOpacity>
  );
}

function QuickCard({ compact, symbol, title, text, onPress }: { compact: boolean; symbol: string; title: string; text: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.quickCard, compact && styles.quickCardCompact]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.quickIconWrap}><Text style={styles.quickIcon}>{symbol}</Text></View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 980, alignSelf: 'center', padding: spacing.md, paddingBottom: spacing.xl * 5 },
  contentCompact: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: spacing.xl * 6 },
  hero: { backgroundColor: colors.surface, borderRadius: 26, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.xs, marginBottom: spacing.lg },
  heroCompact: { borderRadius: 20, padding: 13, marginBottom: spacing.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoCard: { width: 76, height: 76, borderRadius: 21, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  logoCardCompact: { width: 60, height: 60, borderRadius: 17 },
  brandCopy: { flex: 1 },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  appName: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 3 },
  appNameCompact: { fontSize: 21 },
  subGreeting: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 9, marginTop: spacing.md, alignSelf: 'flex-start' },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  statusText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  dashboardHeading: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: spacing.sm, marginLeft: 2 },
  dashboardRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statusCard: { flexGrow: 1, flexBasis: 210, minHeight: 115, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 13 },
  statusCardLabel: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  statusCardValue: { color: colors.text, fontSize: 14, lineHeight: 19, fontWeight: '900', marginTop: 8 },
  providerNumber: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 },
  statusCardLink: { color: colors.primary, fontSize: 9, fontWeight: '800', marginTop: 'auto', paddingTop: 8 },
  snapshotCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
  snapshotRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, paddingVertical: 10 },
  snapshotCopy: { flex: 1, paddingRight: 10 },
  snapshotLabel: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  snapshotValue: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '900', marginTop: 3 },
  snapshotAction: { color: colors.primary, fontSize: 10, fontWeight: '900' },
  snapshotDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 13 },
  todayCard: { backgroundColor: colors.surfaceAlt, borderRadius: 24, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1.5, borderColor: colors.accent },
  todayCardCompact: { borderRadius: 20, padding: 15, marginBottom: spacing.md },
  todayTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  todayEyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  todayReason: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  todayBadge: { backgroundColor: colors.bg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 9, paddingVertical: 5 },
  todayBadgeText: { color: colors.accent, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  todayTitle: { color: colors.text, fontSize: 25, lineHeight: 31, fontWeight: '900', marginTop: 12 },
  todayTitleCompact: { fontSize: 21, lineHeight: 26, marginTop: 10 },
  todayText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 720 },
  todayButton: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 15, paddingVertical: 13, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todayButtonText: { color: '#0F1220', fontSize: 12, fontWeight: '900', flexShrink: 1 },
  todayButtonArrow: { color: '#0F1220', fontSize: 17, fontWeight: '900', marginLeft: 8 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: spacing.sm, marginLeft: 2, marginTop: spacing.sm },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  quickCard: { flexGrow: 1, flexBasis: 200, minHeight: 132, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 13 },
  quickCardCompact: { flexBasis: '46%', minHeight: 125, padding: 11 },
  quickIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  quickIcon: { color: '#0F1220', fontSize: 16, fontWeight: '900' },
  quickTitle: { color: colors.text, fontSize: 13, fontWeight: '900', marginTop: 9 },
  quickText: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  privateIcon: { backgroundColor: colors.accent },
  letterIcon: { backgroundColor: '#F7B267' },
  diaryIcon: { backgroundColor: '#B59CFF' },
  cardIconText: { color: '#0F1220', fontSize: 17, fontWeight: '900' },
  cardCopy: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  cardText: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  arrow: { color: colors.primary, fontSize: 28, marginLeft: spacing.sm },
  noticeText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.sm },
});
