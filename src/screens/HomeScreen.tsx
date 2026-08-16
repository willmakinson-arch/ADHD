import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Logo from '../components/Logo';
import { getComparedProviderIds } from '../data/providerIntelligence';
import { JOURNEY_STAGES } from '../data/journey';
import { colors, spacing, radius } from '../theme/theme';
import { useLocation } from '../context/LocationContext';

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

export default function HomeScreen({ navigation }: any) {
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
        setProgressIndex(Number.isInteger(parsedProgress) && parsedProgress >= 0 && parsedProgress < PROGRESS_LABELS.length ? parsedProgress : 0);
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

  const nextAction = useMemo(() => {
    if (journeyLabel === 'Not set yet' || progressIndex <= 1) {
      return {
        eyebrow: 'START WITH CLARITY',
        title: 'Find the route that fits your situation',
        text: 'Tell Different Minds where you live and where you are in the journey. It will reduce the options to one clear next step.',
        button: 'Find My Route',
        page: 'journey',
      };
    }
    if (progressIndex >= 2 && progressIndex <= 4) {
      return {
        eyebrow: oneThingDone ? 'ENOUGH FOR TODAY' : 'WHILE YOU WAIT',
        title: oneThingDone ? 'Your one useful action is done' : 'Do one useful thing, then stop',
        text: oneThingDone
          ? 'Different Minds has marked your one thing as done today. You can leave the process alone unless something actually changes.'
          : 'Choose the thing taking up the most headspace and Different Minds will turn it into one small action.',
        button: oneThingDone ? 'View While You Wait' : 'Choose my one thing',
        page: 'waiting',
      };
    }
    if (progressIndex === 5) {
      return {
        eyebrow: 'ASSESSMENT BOOKED',
        title: 'Prepare the practical things you do not want to forget',
        text: 'Use the preparation checklist and save your own questions without rehearsing symptoms or coached answers.',
        button: 'Open Assessment Prep',
        page: 'prep',
      };
    }
    return {
      eyebrow: 'AFTER ASSESSMENT',
      title: 'Work out what support matters next',
      text: 'Keep follow-up organised and use Support Finder for the correct UK work and disability-support routes.',
      button: 'Open Support Finder',
      page: 'support',
    };
  }, [journeyLabel, progressIndex, oneThingDone]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <View style={styles.logoCard}><Logo size={62} /></View>
          <View style={styles.brandCopy}>
            <Text style={styles.kicker}>ADHD SUPPORT & GUIDANCE</Text>
            <Text style={styles.appName}>Different Minds</Text>
            <Text style={styles.subGreeting}>A clearer route through assessment and care.</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: locationReady ? colors.success : colors.textMuted }]} />
          <Text style={styles.statusText}>{locationReady ? 'Location ready for nearby clinics' : 'Search clinics by town or postcode'}</Text>
        </View>
      </View>

      <Text style={styles.dashboardHeading}>Your journey at a glance</Text>
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

      <TouchableOpacity style={styles.nextCard} onPress={() => openMore(nextAction.page)} activeOpacity={0.9}>
        <View style={styles.nextTopRow}>
          <Text style={styles.nextEyebrow}>{nextAction.eyebrow}</Text>
          <Text style={styles.nextArrow}>→</Text>
        </View>
        <Text style={styles.nextTitle}>{nextAction.title}</Text>
        <Text style={styles.nextText}>{nextAction.text}</Text>
        <View style={styles.nextButton}><Text style={styles.nextButtonText}>{nextAction.button}</Text><Text style={styles.nextButtonArrow}>→</Text></View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tools that reduce the mental load</Text>
      <View style={styles.quickGrid}>
        <QuickCard symbol="1" title="While You Wait" text="One problem. One useful action." onPress={() => openMore('waiting')} />
        <QuickCard symbol="✉" title="Communication" text="Draft it, review it, then decide whether to send." onPress={() => openMore('communication')} />
        <QuickCard symbol="▤" title="Notes & Evidence" text="Get dates, history and questions out of your head." onPress={() => openMore('evidence')} />
        <QuickCard symbol="+" title="Support Finder" text="Work, adjustments and UK-specific support routes." onPress={() => openMore('support')} />
      </View>

      <Text style={styles.sectionTitle}>Assessment routes & tools</Text>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RTC')} activeOpacity={0.9}>
        <View style={styles.cardIcon}><Text style={styles.cardIconText}>R</Text></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>Right to Choose clinics</Text><Text style={styles.cardText}>Explore NHS-funded assessment routes for England and add providers to compare</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Private')} activeOpacity={0.9}>
        <View style={[styles.cardIcon, styles.privateIcon]}><Text style={styles.cardIconText}>P</Text></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>Private ADHD clinics</Text><Text style={styles.cardText}>Compare nearby or online private options, then verify the full pathway</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Letter')} activeOpacity={0.9}>
        <View style={[styles.cardIcon, styles.letterIcon]}><Text style={styles.cardIconText}>✎</Text></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>Build your GP letter</Text><Text style={styles.cardText}>Create a Right to Choose request to review with your GP</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => openMore('appointments')} activeOpacity={0.9}>
        <View style={[styles.cardIcon, styles.diaryIcon]}><Text style={styles.cardIconText}>●</Text></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>Your appointments</Text><Text style={styles.cardText}>Keep dates and reminders together</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.noticeText}>General information and organisation support only — not a diagnosis. Always confirm important healthcare information with your GP or provider.</Text>
    </ScrollView>
  );
}

function QuickCard({ symbol, title, text, onPress }: { symbol: string; title: string; text: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.quickIconWrap}><Text style={styles.quickIcon}>{symbol}</Text></View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 980, alignSelf: 'center', padding: spacing.md, paddingBottom: spacing.xl * 4 },
  hero: { backgroundColor: colors.surface, borderRadius: 26, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.xs, marginBottom: spacing.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoCard: { width: 76, height: 76, borderRadius: 21, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  brandCopy: { flex: 1 },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  appName: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 3 },
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
  nextCard: { backgroundColor: colors.surfaceAlt, borderRadius: 24, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1.5, borderColor: colors.accent },
  nextTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextEyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  nextArrow: { color: colors.accent, fontSize: 24, fontWeight: '900' },
  nextTitle: { color: colors.text, fontSize: 25, lineHeight: 31, fontWeight: '900', marginTop: 7 },
  nextText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 720 },
  nextButton: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 15, paddingVertical: 13, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextButtonText: { color: '#0F1220', fontSize: 12, fontWeight: '900' },
  nextButtonArrow: { color: '#0F1220', fontSize: 17, fontWeight: '900' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: spacing.sm, marginLeft: 2, marginTop: spacing.sm },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  quickCard: { flexGrow: 1, flexBasis: 200, minHeight: 132, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 13 },
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
  cardText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  arrow: { color: colors.primary, fontSize: 28, marginLeft: spacing.sm },
  noticeText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.sm },
});
