import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  clearComparedProviders,
  findProviderIntelligence,
  getComparedProviderIds,
  ProviderIntelligence,
} from '../data/providerIntelligence';
import { colors, radius, spacing } from '../theme/theme';

export default function ProviderCompareScreen() {
  const [providers, setProviders] = useState<ProviderIntelligence[]>([]);

  const load = useCallback(async () => {
    const ids = await getComparedProviderIds();
    setProviders(ids.map(findProviderIntelligence).filter(Boolean) as ProviderIntelligence[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const clear = async () => {
    await clearComparedProviders();
    setProviders([]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>PROVIDER INTELLIGENCE</Text>
        <Text style={styles.title}>Compare the pathway, not just the headline price.</Text>
        <Text style={styles.subtitle}>
          Save up to three providers from the RTC or Private tabs. Different Minds then puts the important questions side by side so you can see what still needs checking before you commit.
        </Text>
      </View>

      {providers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No providers saved yet</Text>
          <Text style={styles.emptyText}>Open RTC or Private clinics and tap “Add to compare” on providers you want to look at more closely.</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>{providers.length} of 3 providers selected</Text>
            <TouchableOpacity onPress={clear}><Text style={styles.clearText}>Clear comparison</Text></TouchableOpacity>
          </View>

          {providers.map(provider => (
            <View key={provider.id} style={styles.providerCard}>
              <View style={styles.headingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.routeLabel}>{provider.routeLabel}</Text>
                </View>
                <View style={styles.verifyBadge}><Text style={styles.verifyBadgeText}>VERIFY</Text></View>
              </View>

              <ComparisonRow label="Coverage" value={provider.coverage} />
              <ComparisonRow label="Cost" value={provider.priceLabel} />
              <ComparisonRow label="Waiting" value={provider.waitLabel} />
              <ComparisonRow label="Format" value={provider.appointmentType} />
              <ComparisonRow label="Age" value={provider.ages} />

              <View style={styles.insightBox}>
                <Text style={styles.insightLabel}>WHAT THIS TELLS YOU</Text>
                {provider.strengths.map((item, index) => <Text key={index} style={styles.bullet}>• {item}</Text>)}
              </View>

              <View style={styles.checkBox}>
                <Text style={styles.checkLabel}>BEFORE YOU CHOOSE</Text>
                {provider.verifyBeforeChoosing.map((item, index) => (
                  <View key={index} style={styles.checkRow}>
                    <Text style={styles.checkNumber}>{index + 1}</Text>
                    <Text style={styles.checkText}>{item}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.verification}>{provider.verificationLabel}</Text>
              <TouchableOpacity style={styles.providerButton} onPress={() => Linking.openURL(provider.website)}>
                <Text style={styles.providerButtonText}>Check current provider information ↗</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <View style={styles.safetyCard}>
        <Text style={styles.safetyTitle}>Why Different Minds does not rank providers 1–10</Text>
        <Text style={styles.safetyText}>
          The right route depends on eligibility, clinical needs, location, age, cost and follow-up arrangements. A made-up “best provider” score could hide important trade-offs. Different Minds instead shows what is known, what is uncertain and what you should verify.
        </Text>
      </View>
    </ScrollView>
  );
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareLabel}>{label}</Text>
      <Text style={styles.compareValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 3, width: '100%', maxWidth: 980, alignSelf: 'center' },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 24, padding: spacing.lg, borderWidth: 1, borderColor: colors.accent, marginBottom: spacing.md },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 6 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  emptyText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  summaryText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  clearText: { color: colors.danger, fontSize: 11, fontWeight: '800' },
  providerCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  providerName: { color: colors.text, fontSize: 19, fontWeight: '900' },
  routeLabel: { color: colors.accent, fontSize: 10, fontWeight: '800', marginTop: 3 },
  verifyBadge: { backgroundColor: '#F7B267', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  verifyBadgeText: { color: '#0F1220', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  compareRow: { flexDirection: 'row', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 9 },
  compareLabel: { width: 74, color: colors.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  compareValue: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  insightBox: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginTop: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.accent },
  insightLabel: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  bullet: { color: colors.text, fontSize: 10, lineHeight: 16, marginTop: 5 },
  checkBox: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 12, marginTop: spacing.sm },
  checkLabel: { color: colors.text, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 8 },
  checkNumber: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surfaceAlt, color: colors.accent, textAlign: 'center', lineHeight: 22, fontSize: 9, fontWeight: '900' },
  checkText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  verification: { color: '#F7B267', fontSize: 9, lineHeight: 14, fontWeight: '800', marginTop: spacing.sm },
  providerButton: { minHeight: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, paddingHorizontal: 12 },
  providerButtonText: { color: '#0F1220', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  safetyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.sm },
  safetyTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  safetyText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 5 },
});
