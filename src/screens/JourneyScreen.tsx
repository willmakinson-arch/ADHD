import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import {
  GUIDANCE_REVIEWED,
  getJourneyPlan,
  HomeNation,
  JOURNEY_STAGES,
  JourneyAction,
  JourneyStage,
  NATIONS,
} from '../data/journey';
import { colors, radius, spacing } from '../theme/theme';

const NATION_KEY = 'different-minds:journey:nation:v1';
const STAGE_KEY = 'different-minds:journey:stage:v1';

export default function JourneyScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const wide = width >= 780;
  const [nation, setNation] = useState<HomeNation>('england');
  const [stage, setStage] = useState<JourneyStage>('exploring');

  useEffect(() => {
    const load = async () => {
      try {
        const [savedNation, savedStage] = await Promise.all([
          AsyncStorage.getItem(NATION_KEY),
          AsyncStorage.getItem(STAGE_KEY),
        ]);
        if (NATIONS.some(item => item.id === savedNation)) setNation(savedNation as HomeNation);
        if (JOURNEY_STAGES.some(item => item.id === savedStage)) setStage(savedStage as JourneyStage);
      } catch {
        // Safe defaults remain if local storage is unavailable.
      }
    };
    load();
  }, []);

  const plan = useMemo(() => getJourneyPlan(nation, stage), [nation, stage]);
  const nationInfo = NATIONS.find(item => item.id === nation) ?? NATIONS[0];

  const chooseNation = async (value: HomeNation) => {
    setNation(value);
    try { await AsyncStorage.setItem(NATION_KEY, value); } catch {}
  };

  const chooseStage = async (value: JourneyStage) => {
    setStage(value);
    try { await AsyncStorage.setItem(STAGE_KEY, value); } catch {}
  };

  const runAction = async (action: JourneyAction) => {
    if (action.type === 'url') {
      await Linking.openURL(action.url);
      return;
    }
    if (action.type === 'more') {
      navigation.navigate('More', { open: action.page, request: Date.now() });
      return;
    }
    navigation.navigate(action.tab);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>FIND MY ROUTE</Text></View>
          <Text style={styles.title}>Tell us where you are. We’ll make the next step clearer.</Text>
          <Text style={styles.subtitle}>
            Two quick choices turn a complicated ADHD pathway into one practical next action. Your selections stay on this device.
          </Text>
          <View style={styles.stepStrip}>
            <View style={styles.stepItem}><Text style={styles.stepNumber}>1</Text><Text style={styles.stepText}>Choose nation</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}><Text style={styles.stepNumber}>2</Text><Text style={styles.stepText}>Choose your stage</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}><Text style={styles.stepNumber}>3</Text><Text style={styles.stepText}>Get next step</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>1 · WHERE DO YOU LIVE?</Text>
          <Text style={styles.sectionTitle}>Your NHS pathway depends on your nation</Text>
          <View style={styles.chipWrap}>
            {NATIONS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.chip, nation === item.id && styles.chipActive]}
                onPress={() => chooseNation(item.id)}
              >
                <Text style={[styles.chipText, nation === item.id && styles.chipTextActive]}>{item.shortLabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.infoStrip}>
            <Text style={styles.infoStripText}>
              {nationInfo.rtcAvailable
                ? 'England selected · NHS patient choice may apply to some eligible first elective referrals.'
                : `${nationInfo.label} selected · England-specific Right to Choose tools will not be presented as your local NHS route.`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>2 · WHERE ARE YOU IN THE JOURNEY?</Text>
          <Text style={styles.sectionTitle}>Pick the closest match — it does not need to be perfect</Text>
          <View style={styles.stageGrid}>
            {JOURNEY_STAGES.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.stageRow,
                  wide && styles.stageRowWide,
                  stage === item.id && styles.stageRowActive,
                ]}
                onPress={() => chooseStage(item.id)}
              >
                <View style={[styles.radio, stage === item.id && styles.radioActive]}>
                  {stage === item.id && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.stageText, stage === item.id && styles.stageTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.planCard}>
          <View style={styles.resultBadge}><Text style={styles.resultBadgeText}>YOUR NEXT STEP</Text></View>
          <Text style={styles.planEyebrow}>{plan.eyebrow}</Text>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planSummary}>{plan.summary}</Text>

          <View style={styles.pointsBox}>
            {plan.points.map((point, index) => (
              <View key={`${point}-${index}`} style={styles.pointRow}>
                <View style={styles.numberBadge}><Text style={styles.numberText}>{index + 1}</Text></View>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>

          {plan.caution && (
            <View style={styles.cautionBox}>
              <Text style={styles.cautionLabel}>CHECK BEFORE YOU ACT</Text>
              <Text style={styles.cautionText}>{plan.caution}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={() => runAction(plan.primary)}>
            <Text style={styles.primaryButtonText}>{plan.primary.label}</Text>
          </TouchableOpacity>

          {plan.secondary && (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => runAction(plan.secondary!)}>
              <Text style={styles.secondaryButtonText}>{plan.secondary.label}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.trustCard}>
          <Text style={styles.trustTitle}>Built around your journey, not another directory</Text>
          <Text style={styles.trustText}>
            Different Minds remembers the route you select on this device and keeps the next action visible as you move from questions to referral, assessment and follow-up.
          </Text>
          <Text style={styles.sourceText}>Guidance review date: {GUIDANCE_REVIEWED} · Source: {nationInfo.sourceLabel}</Text>
        </View>

        <Text style={styles.footer}>
          General navigation and organisation support only. Different Minds does not diagnose ADHD, determine referral eligibility or replace advice from a GP or specialist.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: spacing.xl * 3 },
  content: { width: '100%', maxWidth: 920, alignSelf: 'center', padding: spacing.md },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 26, padding: spacing.lg, borderWidth: 1, borderColor: colors.primary, marginBottom: spacing.md },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  heroBadgeText: { color: '#0F1220', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 27, lineHeight: 33, fontWeight: '900', marginTop: 10, maxWidth: 680 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 720 },
  stepStrip: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, flexWrap: 'wrap', gap: 7 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepNumber: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bg, color: colors.accent, textAlign: 'center', lineHeight: 22, fontSize: 9, fontWeight: '900', overflow: 'hidden' },
  stepText: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },
  stepLine: { width: 22, height: 1, backgroundColor: colors.border },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  sectionKicker: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 5, marginBottom: 14 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 15, paddingVertical: 11, backgroundColor: colors.bg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: colors.text },
  infoStrip: { marginTop: 13, backgroundColor: colors.bg, borderRadius: radius.md, padding: 12, borderLeftWidth: 3, borderLeftColor: colors.accent },
  infoStripText: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  stageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stageRow: { width: '100%', minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.md, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  stageRowWide: { width: '49%' },
  stageRowActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.primary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  radioActive: { borderColor: colors.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  stageText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  stageTextActive: { color: colors.text, fontWeight: '900' },
  planCard: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.lg, borderWidth: 1, borderColor: colors.accent, marginBottom: spacing.md },
  resultBadge: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12 },
  resultBadgeText: { color: '#0F1220', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  planEyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  planTitle: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 6, maxWidth: 720 },
  planSummary: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 760 },
  pointsBox: { marginTop: spacing.md },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  numberBadge: { width: 27, height: 27, borderRadius: 14, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  numberText: { color: colors.accent, fontSize: 10, fontWeight: '900' },
  pointText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 18, paddingTop: 3 },
  cautionBox: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 12, marginTop: 3, borderLeftWidth: 3, borderLeftColor: '#F7B267' },
  cautionLabel: { color: '#F7B267', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  cautionText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  primaryButton: { backgroundColor: colors.accent, borderRadius: radius.md, minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, paddingHorizontal: 14 },
  primaryButtonText: { color: '#0F1220', fontSize: 13, fontWeight: '900', textAlign: 'center' },
  secondaryButton: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 9, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },
  secondaryButtonText: { color: colors.text, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  trustCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  trustTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  trustText: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 6 },
  sourceText: { color: colors.accent, fontSize: 9, lineHeight: 14, marginTop: 10, fontWeight: '700' },
  footer: { color: colors.textMuted, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.sm },
});
