import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CLINICS, Clinic } from '../data/clinics';
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
  useEffect(() => { if (coords && !origin) setOrigin(coords); }, [coords, origin]);

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

  const card = (item: Clinic, distance?: number) => <View style={styles.card} key={`${item.id}-${distance ?? 'online'}`}>
    <View style={styles.headingRow}><Text style={styles.name}>{item.name}</Text><View style={distance === undefined ? styles.rtcBadge : styles.nhsBadge}><Text style={styles.badgeText}>{distance === undefined ? 'RTC England' : 'NHS route'}</Text></View></View>
    {distance !== undefined && <Text style={styles.distance}>About {distance.toFixed(0)} miles away</Text>}
    <Text style={styles.detail}>Indicative wait: {item.typicalWaitMonths} months · NHS funded</Text>
    <Text style={styles.notes}>{item.notes}</Text>
    <TouchableOpacity onPress={() => Linking.openURL(item.website)}><Text style={styles.link}>Check current provider details →</Text></TouchableOpacity>
  </View>;

  return <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>NHS Right to Choose clinics</Text>
    <Text style={styles.subtitle}>Local physical routes within 30 miles, plus nationwide online RTC providers. RTC is generally for eligible patients registered with a GP in England and is not decided by mileage alone.</Text>
    <View style={styles.searchRow}><TextInput style={styles.input} placeholder="Postcode, town, or city" placeholderTextColor={colors.textMuted} value={place} onChangeText={setPlace} onSubmitEditing={search} /><TouchableOpacity style={styles.searchButton} onPress={search}>{loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.searchText}>Search</Text>}</TouchableOpacity></View>
    {error && <Text style={styles.error}>{error}</Text>}
    {status === 'requesting' && !origin && <View style={styles.locationState}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>Finding NHS routes near you…</Text></View>}
    {(status === 'denied' || status === 'unavailable') && !origin && <View style={styles.locationState}><Text style={styles.stateText}>Location is off. Search manually or allow location access in your browser settings.</Text><TouchableOpacity onPress={requestLocation}><Text style={styles.link}>Try my location again</Text></TouchableOpacity></View>}
    <Text style={styles.sectionTitle}>Physical NHS routes within 30 miles</Text>
    {origin && nearby.length === 0 && <View style={styles.locationState}><Text style={styles.stateText}>No verified physical route is listed within 30 miles. Ask your GP about the local NHS ADHD service and compare the online RTC providers below.</Text></View>}
    {nearby.map(item => card(item, item.distance))}
    <Text style={styles.sectionTitle}>Nationwide online RTC providers</Text>
    <Text style={styles.sectionHelp}>Shown regardless of distance because assessment is delivered online. Check current age criteria, ICB restrictions, waiting time and prescribing pathway.</Text>
    {RTC_CLINICS.map(item => card(item))}
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.xs }, subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }, input: { flex: 1, minHeight: 46, backgroundColor: colors.surface, color: colors.text, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  searchButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center' }, searchText: { color: colors.text, fontWeight: '700' }, error: { color: colors.danger, marginBottom: spacing.sm },
  locationState: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center', gap: spacing.sm }, stateText: { color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.xs }, sectionHelp: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }, headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  name: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 }, rtcBadge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 }, nhsBadge: { backgroundColor: colors.success, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 }, badgeText: { color: '#0F1220', fontSize: 11, fontWeight: '800' },
  distance: { color: colors.accent, fontSize: 12, marginTop: spacing.xs }, detail: { color: colors.text, fontSize: 13, marginTop: spacing.sm }, notes: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: spacing.sm }, link: { color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
});
