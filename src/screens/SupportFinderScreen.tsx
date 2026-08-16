import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeNation, NATIONS } from '../data/journey';
import { colors, radius, spacing } from '../theme/theme';

type SupportGoal = 'work' | 'adjustments' | 'benefits';

const NATION_KEY = 'different-minds:support:nation:v1';
const GOAL_KEY = 'different-minds:support:goal:v1';

const GOALS: { id: SupportGoal; title: string; text: string }[] = [
  { id: 'work', title: 'Help at work', text: 'Find the official employment-support route that applies where you live.' },
  { id: 'adjustments', title: 'Workplace adjustments', text: 'Understand where to start when ADHD or another condition creates barriers at work.' },
  { id: 'benefits', title: 'Disability benefit guidance', text: 'Find the correct official benefit route without assuming that a diagnosis automatically means entitlement.' },
];

function getSupportPlan(nation: HomeNation, goal: SupportGoal) {
  const isNI = nation === 'northern_ireland';
  const isScotland = nation === 'scotland';

  if (goal === 'work') {
    return isNI
      ? {
          eyebrow: 'NORTHERN IRELAND · WORK SUPPORT',
          title: 'Access to Work (NI)',
          summary: 'Northern Ireland has its own Access to Work programme. Use the NI route rather than the GB application.',
          points: [
            'Start with the official Access to Work (NI) guidance.',
            'Describe the practical barriers you experience in your actual job or getting to work.',
            'Keep employer and workplace details together before you apply or speak to a work coach.',
          ],
          label: 'Open Access to Work (NI)',
          url: 'https://www.nidirect.gov.uk/articles/access-work-ni-practical-help-work',
        }
      : {
          eyebrow: 'ENGLAND · SCOTLAND · WALES',
          title: 'Access to Work',
          summary: 'The GB Access to Work scheme may provide practical employment support where the eligibility rules apply.',
          points: [
            'Check the official eligibility rules before applying.',
            'Focus on the barriers you face doing your job or travelling to work, not just the diagnosis label.',
            'Prepare the workplace and contact details the application asks for.',
          ],
          label: 'Check Access to Work eligibility',
          url: 'https://www.gov.uk/access-to-work/eligibility',
        };
  }

  if (goal === 'adjustments') {
    return isNI
      ? {
          eyebrow: 'NORTHERN IRELAND · EMPLOYMENT RIGHTS',
          title: 'Reasonable changes at work',
          summary: 'Northern Ireland uses its own disability-discrimination framework. Start with the NI employment-rights guidance.',
          points: [
            'Write down the specific disadvantage or barrier you are trying to remove.',
            'Think about practical changes to hours, instructions, equipment, environment or duties that may help.',
            'Discuss the barrier and proposed changes with your employer rather than relying on a generic ADHD list.',
          ],
          label: 'Open NI employment-rights guidance',
          url: 'https://www.nidirect.gov.uk/articles/disability-discrimination-law-employment-rights',
        }
      : {
          eyebrow: 'WORKPLACE ADJUSTMENTS',
          title: 'Turn “I am struggling” into a practical request.',
          summary: 'Official guidance explains reasonable adjustments for disabled workers and people with health conditions.',
          points: [
            'Describe the work task or process that puts you at a disadvantage.',
            'Suggest a practical change that could reduce that disadvantage.',
            'Keep the request specific enough that you and your employer can discuss whether it is reasonable and effective.',
          ],
          label: 'Open reasonable-adjustments guidance',
          url: 'https://www.gov.uk/reasonable-adjustments-for-disabled-workers',
        };
  }

  if (isScotland) {
    return {
      eyebrow: 'SCOTLAND · DISABILITY BENEFITS',
      title: 'Adult Disability Payment',
      summary: 'For new working-age disability-benefit applications in Scotland, Different Minds points to Adult Disability Payment rather than the England/Wales PIP route.',
      points: [
        'Check the official “who can apply” rules first.',
        'Eligibility is about the relevant criteria and how a condition affects everyday life, not the ADHD label alone.',
        'Use the official application guidance for supporting information and deadlines.',
      ],
      label: 'Check Adult Disability Payment',
      url: 'https://www.mygov.scot/adult-disability-payment/applicants',
    };
  }

  if (isNI) {
    return {
      eyebrow: 'NORTHERN IRELAND · PIP',
      title: 'Personal Independence Payment (NI)',
      summary: 'Northern Ireland has its own PIP information and claiming route. Different Minds keeps it separate from the GB pages.',
      points: [
        'Read the NI eligibility criteria before starting a claim.',
        'Focus on the relevant everyday-task and mobility difficulties described by the official rules.',
        'Do not assume ADHD diagnosis by itself means a PIP award.',
      ],
      label: 'Open PIP guidance for Northern Ireland',
      url: 'https://www.nidirect.gov.uk/articles/personal-independence-payment-pip',
    };
  }

  return {
    eyebrow: nation === 'wales' ? 'WALES · PIP' : 'ENGLAND · PIP',
    title: 'Personal Independence Payment',
    summary: 'Different Minds can point you to the correct official criteria and help you organise evidence later, but it should never promise that ADHD automatically qualifies.',
    points: [
      'Check the official eligibility criteria before starting a claim.',
      'The relevant issue is how a long-term condition affects specified everyday activities or mobility under the rules.',
      'Keep genuine examples and supporting information organised in your own words.',
    ],
    label: 'Check PIP eligibility',
    url: 'https://www.gov.uk/pip/eligibility',
  };
}

export default function SupportFinderScreen() {
  const [nation, setNation] = useState<HomeNation>('england');
  const [goal, setGoal] = useState<SupportGoal>('work');

  useEffect(() => {
    const load = async () => {
      try {
        const [savedNation, savedGoal] = await Promise.all([
          AsyncStorage.getItem(NATION_KEY),
          AsyncStorage.getItem(GOAL_KEY),
        ]);
        if (NATIONS.some(item => item.id === savedNation)) setNation(savedNation as HomeNation);
        if (GOALS.some(item => item.id === savedGoal)) setGoal(savedGoal as SupportGoal);
      } catch {}
    };
    load();
  }, []);

  const plan = useMemo(() => getSupportPlan(nation, goal), [nation, goal]);

  const chooseNation = async (value: HomeNation) => {
    setNation(value);
    try { await AsyncStorage.setItem(NATION_KEY, value); } catch {}
  };

  const chooseGoal = async (value: SupportGoal) => {
    setGoal(value);
    try { await AsyncStorage.setItem(GOAL_KEY, value); } catch {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>SUPPORT FINDER</Text>
        <Text style={styles.title}>Find the help route that actually applies to you.</Text>
        <Text style={styles.subtitle}>Choose where you live and what you need help with. Different Minds keeps work support, adjustments and disability-benefit guidance separate so you do not follow the wrong UK route.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.step}>1 · YOUR NATION</Text>
        <View style={styles.chipWrap}>
          {NATIONS.map(item => (
            <TouchableOpacity key={item.id} style={[styles.chip, nation === item.id && styles.chipActive]} onPress={() => chooseNation(item.id)}>
              <Text style={[styles.chipText, nation === item.id && styles.chipTextActive]}>{item.shortLabel}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.step}>2 · WHAT DO YOU NEED HELP WITH?</Text>
        {GOALS.map(item => (
          <TouchableOpacity key={item.id} style={[styles.goalCard, goal === item.id && styles.goalCardActive]} onPress={() => chooseGoal(item.id)}>
            <View style={[styles.radio, goal === item.id && styles.radioActive]}>{goal === item.id && <View style={styles.radioInner} />}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              <Text style={styles.goalText}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.planCard}>
        <Text style={styles.planEyebrow}>{plan.eyebrow}</Text>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planSummary}>{plan.summary}</Text>
        <View style={styles.pointsBox}>
          {plan.points.map((point, index) => (
            <View key={index} style={styles.pointRow}>
              <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Linking.openURL(plan.url)}>
          <Text style={styles.primaryButtonText}>{plan.label} ↗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.boundaryCard}>
        <Text style={styles.boundaryTitle}>What Different Minds will not do</Text>
        <Text style={styles.boundaryText}>It will not tell someone they are definitely entitled to a benefit, write exaggerated symptoms, or present a diagnosis as automatic proof of eligibility. The next phase can help organise genuine examples, evidence and correspondence around the official criteria.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 3, width: '100%', maxWidth: 980, alignSelf: 'center' },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 24, padding: spacing.lg, borderWidth: 1, borderColor: colors.accent, marginBottom: spacing.md },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 6 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  step: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.bg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, paddingVertical: 10 },
  chipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },
  chipTextActive: { color: colors.text },
  goalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 7 },
  goalCardActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.primary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  radioActive: { borderColor: colors.accent },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  goalTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  goalText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  planCard: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.lg, borderWidth: 1, borderColor: colors.accent, marginBottom: spacing.md },
  planEyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  planTitle: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 5 },
  planSummary: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  pointsBox: { marginTop: spacing.md },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  number: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  numberText: { color: colors.accent, fontSize: 9, fontWeight: '900' },
  pointText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 17, paddingTop: 3 },
  primaryButton: { minHeight: 46, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, paddingHorizontal: 12 },
  primaryButtonText: { color: '#0F1220', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  boundaryCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12 },
  boundaryTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
  boundaryText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 4 },
});
