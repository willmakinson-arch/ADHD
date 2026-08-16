import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Logo from '../components/Logo';
import {
  GUIDANCE_REVIEWED,
  HomeNation,
  JOURNEY_STAGES,
  JourneyStage,
  NATIONS,
  getJourneyPlan,
} from '../data/journey';
import { colors, radius, spacing } from '../theme/theme';

const PROFILE_KEY = 'different-minds:journey-profile:v1';

type JourneyProfile = {
  nation: HomeNation | null;
  stage: JourneyStage;
};

const DEFAULT_PROFILE: JourneyProfile = {
  nation: null,
  stage: 'exploring',
};

export default function HomeScreen({ navigation }: any) {
  const [profile, setProfile] = useState<JourneyProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(PROFILE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as JourneyProfile;
          setProfile({
            nation: parsed.nation ?? null,
            stage: parsed.stage ?? 'exploring',
          });
        }
      } catch {
        // Keep the safe defaults if local storage is unavailable or invalid.
      } finally {
        setLoaded(true);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async (next: JourneyProfile) => {
    setProfile(next);
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch {
      // The journey still works for this session if persistence is unavailable.
    }
  };

  const selectedNation = useMemo(
    () => NATIONS.find((nation) => nation.id === profile.nation) ?? null,
    [profile.nation]
  );

  const plan = useMemo(
    () => (profile.nation ? getJourneyPlan(profile.nation, profile.stage) : null),
    [profile.nation, profile.stage]
  );

  const openUrl = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => undefined);
  };

  const runPrimaryAction = () => {
    if (!plan) return;
    if (plan.nextActionTab) {
      navigation.navigate(plan.nextActionTab);
      return;
    }
    openUrl(plan.nextActionUrl);
  };

  const runSecondaryAction = () => {
    if (!plan?.secondaryActionUrl) return;
    openUrl(plan.secondaryActionUrl);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Logo size={54} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>DIFFERENT MINDS</Text>
          <Text style={styles.heroTitle}>Your ADHD journey. One clear next step.</Text>
          <Text style={styles.heroSubtitle}>
            A UK-focused route through assessment and support — without pretending one pathway fits everyone.
          </Text>
        </View>
      </View>

      <View style={styles.trustRow}>
        <View style={styles.trustPill}>
          <Text style={styles.trustPillText}>Nation-aware</Text>
        </View>
        <View style={styles.trustPill}>
          <Text style={styles.trustPillText}>Source-linked</Text>
        </View>
        <View style={styles.trustPill}>
          <Text style={styles.trustPillText}>You stay in control</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionEyebrow}>1 · WHERE DO YOU LIVE?</Text>
        <Text style={styles.sectionTitle}>Set the right UK pathway first</Text>
        <Text style={styles.sectionBody}>
          Different Minds keeps England, Scotland, Wales and Northern Ireland separate so guidance intended for one nation is not presented as UK-wide.
        </Text>

        <View style={styles.choiceGrid}>
          {NATIONS.map((nation) => {
            const active = profile.nation === nation.id;
            return (
              <TouchableOpacity
                key={nation.id}
                style={[styles.choiceButton, active && styles.choiceButtonActive]}
                onPress={() => saveProfile({ ...profile, nation: nation.id })}
              >
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                  {nation.shortLabel}
                </Text>
                {nation.rtcAvailable && <Text style={styles.choiceMeta}>Patient choice route</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionEyebrow}>2 · WHERE ARE YOU NOW?</Text>
        <Text style={styles.sectionTitle}>Tell the app what stage you are at</Text>
        <Text style={styles.sectionBody}>
          Change this whenever your situation changes. The home screen then becomes your personal next-step dashboard.
        </Text>

        <View style={styles.stageList}>
          {JOURNEY_STAGES.map((stage) => {
            const active = profile.stage === stage.id;
            return (
              <TouchableOpacity
                key={stage.id}
                style={[styles.stageButton, active && styles.stageButtonActive]}
                onPress={() => saveProfile({ ...profile, stage: stage.id })}
              >
                <View style={[styles.stageDot, active && styles.stageDotActive]} />
                <View style={styles.stageCopy}>
                  <Text style={[styles.stageText, active && styles.stageTextActive]}>
                    {stage.label}
                  </Text>
                  {active && <Text style={styles.stageSelected}>Your current stage</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!loaded && (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading your journey…</Text>
        </View>
      )}

      {loaded && !profile.nation && (
        <View style={styles.routeCardMuted}>
          <Text style={styles.routeEyebrow}>YOUR ROUTE</Text>
          <Text style={styles.routeTitle}>Choose your UK nation above to unlock your next step.</Text>
          <Text style={styles.routeSummary}>
            This prevents Different Minds from showing England-only patient-choice information to people elsewhere in the UK.
          </Text>
        </View>
      )}

      {loaded && plan && selectedNation && (
        <View style={styles.routeCard}>
          <View style={styles.routeHeaderRow}>
            <View style={styles.routeHeaderCopy}>
              <Text style={styles.routeEyebrow}>{plan.eyebrow}</Text>
              <Text style={styles.routeTitle}>{plan.title}</Text>
            </View>
            <View style={styles.nationBadge}>
              <Text style={styles.nationBadgeText}>{selectedNation.shortLabel}</Text>
            </View>
          </View>

          <Text style={styles.routeSummary}>{plan.summary}</Text>

          <View style={styles.nextStepBox}>
            <Text style={styles.nextStepLabel}>YOUR NEXT STEP</Text>
            {plan.points.map((point, index) => (
              <View key={`${point}-${index}`} style={styles.pointRow}>
                <View style={styles.pointNumber}>
                  <Text style={styles.pointNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={runPrimaryAction}>
            <Text style={styles.primaryButtonText}>{plan.nextActionLabel}</Text>
          </TouchableOpacity>

          {plan.secondaryActionLabel && plan.secondaryActionUrl && (
            <TouchableOpacity style={styles.secondaryButton} onPress={runSecondaryAction}>
              <Text style={styles.secondaryButtonText}>{plan.secondaryActionLabel}</Text>
            </TouchableOpacity>
          )}

          {plan.caution && (
            <View style={styles.cautionBox}>
              <Text style={styles.cautionLabel}>GOOD TO KNOW</Text>
              <Text style={styles.cautionText}>{plan.caution}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.sourceBox}
            onPress={() => openUrl(selectedNation.sourceUrl)}
          >
            <View style={styles.sourceCopy}>
              <Text style={styles.sourceLabel}>OFFICIAL SOURCE</Text>
              <Text style={styles.sourceTitle}>{selectedNation.sourceLabel}</Text>
              <Text style={styles.sourceMeta}>Guidance reviewed in app: {GUIDANCE_REVIEWED}</Text>
            </View>
            <Text style={styles.sourceArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.missionCard}>
        <Text style={styles.missionKicker}>WHAT MAKES DIFFERENT MINDS DIFFERENT</Text>
        <Text style={styles.missionTitle}>Not another ADHD planner. Not just another clinic list.</Text>
        <Text style={styles.missionBody}>
          The goal is to connect the whole journey: understand your route, compare legitimate options, prepare paperwork, track milestones and know what comes next — while keeping important decisions with you and your healthcare professionals.
        </Text>
      </View>

      <Text style={styles.noticeText}>
        General information and navigation support only. Different Minds does not diagnose ADHD, provide emergency care or replace advice from your GP, specialist or other qualified professional.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  hero: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroCopy: { flex: 1 },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: { color: colors.text, fontSize: 27, lineHeight: 32, fontWeight: '800' },
  heroSubtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  trustPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trustPillText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 5,
  },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  sectionBody: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  choiceButton: {
    width: '48%',
    minHeight: 58,
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceButtonActive: { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
  choiceText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  choiceTextActive: { color: colors.text },
  choiceMeta: { color: colors.accent, fontSize: 9, marginTop: 3, fontWeight: '700' },
  stageList: { gap: 8, marginTop: spacing.md },
  stageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageButtonActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  stageDotActive: { backgroundColor: colors.accent },
  stageCopy: { flex: 1 },
  stageText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  stageTextActive: { color: colors.text, fontWeight: '800' },
  stageSelected: { color: colors.accent, fontSize: 9, marginTop: 2, fontWeight: '700' },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  loadingText: { color: colors.textMuted, textAlign: 'center' },
  routeCardMuted: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  routeHeaderRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  routeHeaderCopy: { flex: 1 },
  routeEyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  routeTitle: { color: colors.text, fontSize: 23, lineHeight: 28, fontWeight: '900' },
  routeSummary: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 10 },
  nationBadge: {
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nationBadgeText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  nextStepBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextStepLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  pointRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  pointNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointNumberText: { color: colors.accent, fontSize: 10, fontWeight: '900' },
  pointText: { color: colors.text, flex: 1, fontSize: 12, lineHeight: 18 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.text, fontWeight: '900', fontSize: 14 },
  secondaryButton: {
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  secondaryButtonText: { color: colors.accent, fontWeight: '800', fontSize: 13 },
  cautionBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 12,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  cautionLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  cautionText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  sourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceCopy: { flex: 1 },
  sourceLabel: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  sourceTitle: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 3 },
  sourceMeta: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  sourceArrow: { color: colors.accent, fontSize: 28, marginLeft: 8 },
  missionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  missionKicker: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  missionTitle: { color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: '900' },
  missionBody: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  noticeText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});
