import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { CLINICS, Clinic } from '../data/clinics';
import { searchLocation, distanceMiles } from '../utils/location';
import { colors, spacing, radius } from '../theme/theme';

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
    })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    setResults(withDistance);
  };

  const renderItem = ({ item }: { item: ClinicWithDistance }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clinicName}>{item.name}</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                item.type === 'nhs_direct' ? colors.success : colors.primary,
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {item.type === 'nhs_direct'
              ? 'NHS Direct'
              : item.rtcEligible
              ? 'RTC Eligible'
              : 'Private'}
          </Text>
        </View>
      </View>
      {item.distance !== null && (
        <Text style={styles.distance}>{item.distance.toFixed(0)} miles away</Text>
      )}
      <Text style={styles.row}>
        Wait: {item.typicalWaitMonths} months · {item.priceFrom ?? 'Free via NHS'}
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL(item.website)}>
        <Text style={styles.link}>Visit website →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find a provider</Text>
      <Text style={styles.subtitle}>Enter a postcode, town, or city to sort by distance.</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Postcode or town, e.g. Manchester"
          placeholderTextColor={colors.textMuted}
          value={place}
          onChangeText={setPlace}
          autoCapitalize="words"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search}>
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.searchBtnText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
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
  searchBtnText: { color: colors.text, fontWeight: '600' },
  error: { color: colors.danger, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  clinicName: { color: colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#0F1220', fontSize: 11, fontWeight: '700' },
  distance: { color: colors.accent, fontSize: 12, marginBottom: spacing.xs },
  row: { color: colors.text, fontSize: 13, marginBottom: 2 },
  label: { color: colors.textMuted },
  notes: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs, marginBottom: spacing.xs },
  link: { color: colors.primary, fontWeight: '600', marginTop: spacing.xs },
});
