import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PRIVATE_CLINICS, PrivateClinic } from '../data/privateClinics';
import { getComparedProviderIds, MAX_PROVIDER_COMPARE, toggleComparedProvider } from '../data/providerIntelligence';
import { distanceMiles, searchLocation, Coords } from '../utils/location';
import { colors, radius, spacing } from '../theme/theme';
import { useLocation } from '../context/LocationContext';

type Result = PrivateClinic & { distance: number };

export default function PrivateClinicsScreen() {
  const { coords, status, requestLocation, setSearchCoords } = useLocation();
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(coords);
  const [compared, setCompared] = useState<string[]>([]);
  const [compareMessage, setCompareMessage] = useState<string | null>(null);

  useEffect(() => { if (coords && !origin) setOrigin(coords); }, [coords, origin]);
  useEffect(() => { getComparedProviderIds().then(setCompared); }, []);

  const results = useMemo<Result[]>(() => {
    if (!origin) return [];
    return PRIVATE_CLINICS
      .filter(clinic => clinic.physicalClinic !== false)
      .map(clinic => ({ ...clinic, distance: distanceMiles(origin, clinic) }))
      .filter(clinic => clinic.distance <= 30)
      .sort((a, b) => a.distance - b.distance);
  }, [origin]);
  const onlineClinics = PRIVATE_CLINICS.filter(clinic => clinic.onlineUkWide);

  const search = async () => {
    setError(null);
    if (!place.trim()) { requestLocation(); return; }
    setLoading(true);
    const found = await searchLocation(place);
    setLoading(false);
    if (!found) { setError("We couldn't find that location. Try a full postcode, town, or city."); return; }
    setOrigin(found);
    setSearchCoords(found);
  };

  const toggleCompare = async (item: PrivateClinic) => {
    const id = `private:${item.id}`;
    if (!compared.includes(id) && compared.length >= MAX_PROVIDER_COMPARE) {
      setCompareMessage('You can compare up to three providers. Remove one in Provider Intelligence before adding another.');
      return;
    }
    const next = await toggleComparedProvider(id);
    setCompared(next);
    setCompareMessage(next.includes(id) ? `${item.name} saved for comparison.` : `${item.name} removed from comparison.`);
  };

  const card = (item: Result | PrivateClinic, online = false) => {
    const compareId = `private:${item.id}`;
    const selected = compared.includes(compareId);
    return (
      <View style={styles.card} key={`${online ? 'online-' : ''}${item.id}`}>
        <View style={styles.headingRow}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={online ? styles.onlineBadge : styles.badge}><Text style={styles.badgeText}>{online ? 'Online UK' : 'Private'}</Text></View>
        </View>
        {'distance' in item && <Text style={styles.distance}>About {item.distance.toFixed(0)} miles away</Text>}
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.detail}>{item.appointmentType}</Text>
        <Text style={styles.detail}>{item.ages}</Text>

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>INDICATIVE PRICE — VERIFY CURRENT TOTAL</Text>
          <Text style={styles.priceText}>{item.priceFrom}</Text>
          <Text style={styles.priceHelp}>Assessment price alone may not include titration, prescriptions, reviews or shared-care administration.</Text>
        </View>

        <Text style={styles.notes}>{item.notes}</Text>

        <TouchableOpacity style={[styles.compareButton, selected && styles.compareButtonActive]} onPress={() => toggleCompare(item)}>
          <Text style={[styles.compareButtonText, selected && styles.compareButtonTextActive]}>{selected ? '✓ Saved to Provider Intelligence' : '+ Add to compare'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(item.website)}><Text style={styles.link}>Check current provider details →</Text></TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.kicker}>PRIVATE ADHD ASSESSMENT</Text>
        <Text style={styles.title}>Compare the whole care pathway</Text>
        <Text style={styles.subtitle}>Search nearby clinics or online options, save up to three, then use Provider Intelligence to compare the questions that can change the real cost and experience.</Text>
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
      {status === 'requesting' && !origin && <View style={styles.locationState}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>Finding clinics near you…</Text></View>}
      {(status === 'denied' || status === 'unavailable') && !origin && <View style={styles.locationState}><Text style={styles.stateText}>Location is off. Enter a postcode, town, or city, or allow location access in your browser settings.</Text><TouchableOpacity onPress={requestLocation}><Text style={styles.link}>Try my location again</Text></TouchableOpacity></View>}
      {origin && results.length === 0 && <View style={styles.locationState}><Text style={styles.stateText}>No physical ADHD clinics are listed within 30 miles in the current seed data. Try a nearby city or use a nationwide online provider below.</Text></View>}

      <Text style={styles.sectionTitle}>Nearby private options</Text>
      {results.map(item => card(item))}
      <Text style={styles.sectionTitle}>Nationwide online providers</Text>
      <Text style={styles.sectionHelp}>Online availability is shown separately. Verify current age criteria, assessment format, total pathway cost and prescribing arrangements directly with the provider.</Text>
      {onlineClinics.map(item => card(item, true))}

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>Before paying for any private assessment</Text>
        <Text style={styles.warningText}>Ask what happens if medication is recommended, what titration and follow-up cost, and whether your GP would consider any future shared-care arrangement. Do not assume NHS prescribing will automatically follow a private diagnosis.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 3, width: '100%', maxWidth: 980, alignSelf: 'center' },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 24, borderWidth: 1, borderColor: colors.accent, padding: spacing.lg, marginBottom: spacing.md },
  kicker: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 23, fontWeight: '900', marginTop: 5 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  compareStrip: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, padding: 12, marginBottom: spacing.sm },
  compareStripTitle: { color: colors.accent, fontSize: 11, fontWeight: '900' },
  compareStripText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  compareMessage: { color: colors.accent, fontSize: 10, fontWeight: '700', marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  input: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, minHeight: 46 },
  searchButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  searchText: { color: '#0F1220', fontWeight: '900' },
  error: { color: colors.danger, marginBottom: spacing.sm },
  locationState: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center', gap: spacing.sm },
  stateText: { color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: spacing.md, marginBottom: spacing.xs },
  sectionHelp: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  name: { color: colors.text, fontSize: 16, fontWeight: '900', flex: 1 },
  badge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  onlineBadge: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { color: '#0F1220', fontSize: 10, fontWeight: '900' },
  distance: { color: colors.accent, fontSize: 12, marginTop: spacing.xs },
  location: { color: colors.text, fontWeight: '700', marginTop: spacing.sm },
  detail: { color: colors.text, fontSize: 12, marginTop: 3 },
  priceBox: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 10, marginTop: spacing.sm, borderLeftWidth: 3, borderLeftColor: '#F7B267' },
  priceLabel: { color: '#F7B267', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  priceText: { color: colors.text, fontSize: 13, fontWeight: '900', marginTop: 4 },
  priceHelp: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  notes: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: spacing.sm },
  compareButton: { minHeight: 42, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, paddingHorizontal: 12 },
  compareButtonActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.accent },
  compareButtonText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  compareButtonTextActive: { color: colors.accent },
  link: { color: colors.primary, fontWeight: '800', marginTop: spacing.sm, fontSize: 11 },
  warningCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: '#F7B267', padding: 12, marginTop: spacing.md },
  warningTitle: { color: '#F7B267', fontSize: 12, fontWeight: '900' },
  warningText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 4 },
});
