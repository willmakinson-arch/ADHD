import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CLINICS, Clinic } from '../data/clinics';
import { colors, radius, spacing } from '../theme/theme';
import { distanceMiles, searchLocation } from '../utils/location';

interface ClinicWithDistance extends Clinic {
  distance: number | null;
}

export default function ClinicsScreen() {
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ClinicWithDistance[]>(
    CLINICS.map((c) => ({ ...c, distance: null }))
  );

  const search = async () => {
    setError(null);
    if (!place.trim()) {
      setResults(CLINICS.map((c) => ({ ...c, distance: null })));
      return;
    }

    setLoading(true);
    const coords = await searchLocation(place);
    setLoading(false);

    if (!coords) {
      setError("Couldn't find that — try a postcode or a town/city name.");
      return;
    }

    const withDistance = CLINICS.map((c) => ({
      ...c,
      distance: distanceMiles(coords, { lat: c.lat, lng: c.lng }),
    })).sort((a, b) => (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE));

    setResults(withDistance);
  };

  const renderItem = ({ item }: { item: ClinicWithDistance }) => {
    const routeLabel =
      item.type === 'nhs_direct' ? 'Local NHS' : item.rtcEligible ? 'England RTC listed' : 'Private';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.clinicName}>{item.name}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.type === 'nhs_direct' ? colors.success : colors.primary },
            ]}
          >
            <Text style={styles.badgeText}>{routeLabel}</Text>
          </View>
        </View>

        <Text style={styles.coverage}>{item.regionsCovered}</Text>

        {item.distance !== null && item.type !== 'nhs_direct' && (
          <Text style={styles.distance}>
            Approx. provider hub distance: {item.distance.toFixed(0)} miles
          </Text>
        )}

        <View style={styles.factRow}>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>LISTED WAIT</Text>
            <Text style={styles.factValue}>{item.typicalWaitMonths} months</Text>
            <Text style={styles.factVerify}>Verify current</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>LISTED PRICE</Text>
            <Text style={styles.factValue}>{item.priceFrom ?? 'NHS-funded route'}</Text>
            <Text style={styles.factVerify}>Verify current</Text>
          </View>
        </View>

        <Text style={styles.notes}>{item.notes}</Text>

        <TouchableOpacity
          style={styles.providerButton}
          onPress={() => Linking.openURL(item.website).catch(() => undefined)}
        >
          <Text style={styles.providerButtonText}>Verify on provider website →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>COMPARE, THEN VERIFY</Text>
        <Text style={styles.title}>Assessment providers</Text>
        <Text style={styles.subtitle}>
          Use location to organise the directory, then verify the details that matter before you make a referral or spend money.
        </Text>
      </View>

      <View style={styles.trustCard}>
        <Text style={styles.trustTitle}>Provider information changes quickly</Text>
        <Text style={styles.trustText}>
          Waiting times, prices, NHS availability, prescribing and shared-care arrangements can change. This Phase 1 directory is a starting point, not a live guarantee. A verification layer is the next data upgrade.
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Postcode or town, e.g. Manchester"
          placeholderTextColor={colors.textMuted}
          value={place}
          onChangeText={setPlace}
          onSubmitEditing={search}
          autoCapitalize="words"
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search}>
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.searchBtnText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.searchHelp}>
        Many ADHD providers operate online. Distance is based on the approximate provider hub in the seed dataset and does not mean the assessment is delivered at that location.
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  heroCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 4,
  },
  title: { color: colors.text, fontSize: 23, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  trustCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    marginBottom: spacing.sm,
  },
  trustTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  trustText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 6 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  searchBtnText: { color: colors.text, fontWeight: '800' },
  searchHelp: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginBottom: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  clinicName: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#0F1220', fontSize: 9, fontWeight: '900' },
  coverage: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginBottom: 4 },
  distance: { color: colors.accent, fontSize: 10, marginBottom: spacing.sm, fontWeight: '700' },
  factRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  factBox: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factLabel: { color: colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  factValue: { color: colors.text, fontSize: 12, fontWeight: '800', marginTop: 3 },
  factVerify: { color: colors.accent, fontSize: 8, fontWeight: '700', marginTop: 2 },
  notes: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: spacing.sm },
  providerButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerButtonText: { color: colors.accent, fontWeight: '800', fontSize: 11 },
});
