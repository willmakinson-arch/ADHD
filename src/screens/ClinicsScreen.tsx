import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CLINICS, Clinic } from '../data/clinics';
import { getComparedProviderIds, MAX_PROVIDER_COMPARE, toggleComparedProvider } from '../data/providerIntelligence';
import { Coords, distanceMiles, searchLocation } from '../utils/location';
import { colors, radius, spacing } from '../theme/theme';
import { useLocation } from '../context/LocationContext';

type Result = Clinic & { distance: number };
const RTC_CLINICS = CLINICS.filter(clinic => clinic.rtcEligible);
const PHYSICAL_ROUTES = CLINICS.filter(clinic => clinic.type === 'nhs_direct');

export default function ClinicsScreen() {
  const { coords, status, requestLocation, setSearchCoords } = useLocation();
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(coords);
  const [compared, setCompared] = useState<string[]>([]);
  const [compareMessage, setCompareMessage] = useState<string | null>(null);

  useEffect(() => { if (coords && !origin) setOrigin(coords); }, [coords, origin]);
  useEffect(() => { getComparedProviderIds().then(setCompared); }, []);

  const nearby = useMemo<Result[]>(() => {
    if (!origin) return [];
    return PHYSICAL_ROUTES.map(clinic => ({ ...clinic, distance: distanceMiles(origin, clinic) })).filter(clinic => clinic.distance <= 30).sort((a, b) => a.distance - b.distance);
  }, [origin]);

  const search = async () => {
    setError(null);
    if (!place.trim()) { requestLocation(); return; }
    setLoading(true);
    const found = await searchLocation(place);
    setLoading(false);
    if (!found) { setError("Couldn't find that location. Try a full postcode, town, or city."); return; }
    setOrigin(found); setSearchCoords(found);
  };

  const toggleCompare = async (item: Clinic) => {
    const id = `rtc:${item.id}`;
    if (!compared.includes(id) && compared.length >= MAX_PROVIDER_COMPARE) {
      setCompareMessage('You can compare up to three providers. Remove one in Provider Intelligence before adding another.');
      return;
    }
    const next = await toggleComparedProvider(id);
    setCompared(next);
    setCompareMessage(next.includes(id) ? `${item.name} saved for comparison.` : `${item.name} removed from comparison.`);
  };

  const card = (item: Clinic, distance?: number) => {
    const compareId = `rtc:${item.id}`;
    const selected = compared.includes(compareId);
    return (
      <View style={styles.card} key={`${item.id}-${distance ?? 'online'}`}>
        <View style={styles.headingRow}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={distance === undefined ? styles.rtcBadge : styles.nhsBadge}><Text style={styles.badgeText}>{distance === undefined ? 'RTC England' : 'NHS route'}</Text></View>
        </View>
        {distance !== undefined && <Text style={styles.distance}>About {distance.toFixed(0)} miles away</Text>}
        <Text style={styles.detail}>{distance === undefined ? 'NHS-funded if an eligible referral is accepted' : 'Local NHS route'}</Text>
        <View style={styles.storedInfo}>
          <Text style={styles.storedLabel}>CURRENT CHECK NEEDED</Text>
          <Text style={styles.storedText}>Stored wait estimate: {item.typicalWaitMonths} months. Do not rely on this without checking the provider/service now.</Text>
        </View>
        <Text style={styles.notes}>{item.notes}</Text>
        {distance === undefined && (
          <TouchableOpacity style={[styles.compareButton, selected && styles.compareButtonActive]} onPress={() => toggleCompare(item)}>
            <Text style={[styles.compareButtonText, selected && styles.compareButtonTextActive]}>{selected ? '✓ Saved to Provider Intelligence' : '+ Add to compare'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => Linking.openURL(item.website)}><Text style={styles.link}>Check current provider details →</Text></TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.kicker}>ENGLAND · NHS PATIENT CHOICE</Text>
        <Text style={styles.title}>Right to Choose providers</Text>
        <Text style={styles.subtitle}>Find routes, save providers you want to compare, and check the parts that matter beyond a headline waiting time.</Text>
      </View>

      {compared.length > 0 && (
        <View style={styles.compareStrip}>
          <Text style={styles.compareStripTitle}>Provider Intelligence</Text>
          <Text style={styles.compareStripText}>{compared.length} of {MAX_PROVIDER_COMPARE} comparison slots used. Open More → Provider Intelligence to review them together.</Text>
        </View>
      )}
      {compareMessage && <Text style={styles.compareMessage}>{compareMessage}</Text>}

      <View style={styles.searchRow}>
        <TextInput style={styles.input} placeholder="Postcode, town, or city" placeholderTextColor={colors.textMuted} value={place} onChangeText={setPlace} onSubmitEditing={search} />
        <TouchableOpacity style={styles.searchButton} onPress={search}>{loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.searchText}>Search</Text>}</TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {status === 'requesting' && !origin && <View style={styles.locationState}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>Finding NHS routes near you…</Text></View>}
      {(status === 'denied' || status === 'unavailable') && !origin && <View style={styles.locationState}><Text style={styles.stateText}>Location is off. Search manually or allow location access in your browser settings.</Text><TouchableOpacity onPress={requestLocation}><Text style={styles.link}>Try my location again</Text></TouchableOpacity></View>}

      <Text style={styles.sectionTitle}>Physical NHS routes within 30 miles</Text>
      {origin && nearby.length === 0 && <View style={styles.locationState}><Text style={styles.stateText}>No physical route is listed within 30 miles in the current seed data. Ask your GP about the local NHS ADHD service and compare the online RTC providers below.</Text></View>}
      {nearby.map(item => card(item, item.distance))}

      <Text style={styles.sectionTitle}>Nationwide online RTC providers</Text>
      <Text style={styles.sectionHelp}>Distance is not used for these online providers. Check current age criteria, referral acceptance, waiting time and what happens after assessment.</Text>
      {RTC_CLINICS.map(item => card(item))}

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>Different Minds verification rule</Text>
        <Text style={styles.footerText}>Provider availability, waits and post-assessment arrangements can change. The app should make stale information obvious rather than presenting it as a guarantee.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 3, width: '100%', maxWidth: 980, alignSelf: 'center' },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 24, borderWidth: 1, borderColor: colors.primary, padding: spacing.lg, marginBottom: spacing.md },
  kicker: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 23, fontWeight: '900', marginTop: 5 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  compareStrip: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, padding: 12, marginBottom: spacing.sm },
  compareStripTitle: { color: colors.accent, fontSize: 11, fontWeight: '900' },
  compareStripText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  compareMessage: { color: colors.accent, fontSize: 10, fontWeight: '700', marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  input: { flex: 1, minHeight: 46, backgroundColor: colors.surface, color: colors.text, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  searchButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  searchText: { color: '#0F1220', fontWeight: '900' },
  error: { color: colors.danger, marginBottom: spacing.sm },
  locationState: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center', gap: spacing.sm },
  stateText: { color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: spacing.md, marginBottom: spacing.xs },
  sectionHelp: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  name: { color: colors.text, fontSize: 16, fontWeight: '900', flex: 1 },
  rtcBadge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  nhsBadge: { backgroundColor: colors.success, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { color: '#0F1220', fontSize: 10, fontWeight: '900' },
  distance: { color: colors.accent, fontSize: 12, marginTop: spacing.xs },
  detail: { color: colors.text, fontSize: 12, fontWeight: '800', marginTop: spacing.sm },
  storedInfo: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 10, marginTop: spacing.sm, borderLeftWidth: 3, borderLeftColor: '#F7B267' },
  storedLabel: { color: '#F7B267', fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  storedText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  notes: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: spacing.sm },
  compareButton: { minHeight: 42, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, paddingHorizontal: 12 },
  compareButtonActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.accent },
  compareButtonText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  compareButtonTextActive: { color: colors.accent },
  link: { color: colors.primary, fontWeight: '800', marginTop: spacing.sm, fontSize: 11 },
  footerCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  footerTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
  footerText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
});
