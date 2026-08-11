import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PRIVATE_CLINICS, PrivateClinic } from '../data/privateClinics';
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

  useEffect(() => { if (coords && !origin) setOrigin(coords); }, [coords, origin]);

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

  const card = (item: Result | PrivateClinic, online = false) => (
    <View style={styles.card} key={`${online ? 'online-' : ''}${item.id}`}>
      <View style={styles.headingRow}><Text style={styles.name}>{item.name}</Text><View style={online ? styles.onlineBadge : styles.badge}><Text style={styles.badgeText}>{online ? 'Online UK' : 'Private'}</Text></View></View>
      {'distance' in item && <Text style={styles.distance}>About {item.distance.toFixed(0)} miles away</Text>}
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.detail}>{item.priceFrom} · {item.appointmentType}</Text>
      <Text style={styles.detail}>{item.ages}</Text>
      <Text style={styles.notes}>{item.notes}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(item.website)}><Text style={styles.link}>Check provider details →</Text></TouchableOpacity>
    </View>
  );

  return <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>Private ADHD clinics</Text>
    <Text style={styles.subtitle}>Physical clinics within 30 miles. Search another postcode, town, or city to move the radius.</Text>
    <View style={styles.searchRow}>
      <TextInput style={styles.input} placeholder="Postcode, town, or city" placeholderTextColor={colors.textMuted} value={place} onChangeText={setPlace} onSubmitEditing={search} />
      <TouchableOpacity style={styles.searchButton} onPress={search}>{loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.searchText}>Search</Text>}</TouchableOpacity>
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
    {status === 'requesting' && !origin && <View style={styles.locationState}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>Finding clinics near you…</Text></View>}
    {(status === 'denied' || status === 'unavailable') && !origin && <View style={styles.locationState}><Text style={styles.stateText}>Location is off. Enter a postcode, town, or city, or allow location access in your browser settings.</Text><TouchableOpacity onPress={requestLocation}><Text style={styles.link}>Try my location again</Text></TouchableOpacity></View>}
    {origin && results.length === 0 && <View style={styles.locationState}><Text style={styles.stateText}>No verified physical ADHD clinics were found within 30 miles. Try a nearby city or use a nationwide online provider below.</Text></View>}
    {results.map(item => card(item))}
    <Text style={styles.sectionTitle}>Nationwide online providers</Text>
    <Text style={styles.sectionHelp}>Shown separately because online appointments are available across the UK.</Text>
    {onlineClinics.map(item => card(item, true))}
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  input: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, minHeight: 46 },
  searchButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  searchText: { color: colors.text, fontWeight: '700' }, error: { color: colors.danger, marginBottom: spacing.sm },
  locationState: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center', gap: spacing.sm },
  stateText: { color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.sm, marginBottom: spacing.xs },
  sectionHelp: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  name: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 },
  badge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  onlineBadge: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { color: '#0F1220', fontSize: 11, fontWeight: '800' },
  distance: { color: colors.accent, fontSize: 12, marginTop: spacing.xs },
  location: { color: colors.text, fontWeight: '600', marginTop: spacing.sm },
  detail: { color: colors.text, fontSize: 13, marginTop: 3 },
  notes: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: spacing.sm },
  link: { color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
});
