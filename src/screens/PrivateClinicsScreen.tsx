import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PRIVATE_CLINICS, PrivateClinic } from '../data/privateClinics';
import { distanceMiles, searchLocation } from '../utils/location';
import { colors, radius, spacing } from '../theme/theme';

type Result = PrivateClinic & { distance: number | null };

export default function PrivateClinicsScreen() {
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>(PRIVATE_CLINICS.map(c => ({ ...c, distance: null })));

  const search = async () => {
    setError(null);
    if (!place.trim()) {
      setResults(PRIVATE_CLINICS.map(c => ({ ...c, distance: null })));
      return;
    }
    setLoading(true);
    const coords = await searchLocation(place);
    setLoading(false);
    if (!coords) {
      setError("We couldn't find that location. Try a full postcode, town, or city.");
      return;
    }
    setResults(PRIVATE_CLINICS.map(c => ({ ...c, distance: distanceMiles(coords, c) })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Private ADHD clinics</Text>
      <Text style={styles.subtitle}>Find specialist private assessment providers near you. Always confirm the total assessment, medication and follow-up costs before paying.</Text>
      <View style={styles.searchRow}>
        <TextInput style={styles.input} placeholder="Postcode, town, or city" placeholderTextColor={colors.textMuted} value={place} onChangeText={setPlace} onSubmitEditing={search} />
        <TouchableOpacity style={styles.searchButton} onPress={search}>{loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.searchText}>Search</Text>}</TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headingRow}><Text style={styles.name}>{item.name}</Text><View style={styles.badge}><Text style={styles.badgeText}>Private</Text></View></View>
            {item.distance !== null && <Text style={styles.distance}>About {item.distance.toFixed(0)} miles from search location</Text>}
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.detail}>{item.priceFrom} · {item.appointmentType}</Text>
            <Text style={styles.detail}>{item.ages}</Text>
            <Text style={styles.notes}>{item.notes}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(item.website)}><Text style={styles.link}>Check provider details →</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  input: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, minHeight: 46 },
  searchButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  searchText: { color: colors.text, fontWeight: '700' },
  error: { color: colors.danger, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  name: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 },
  badge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { color: '#0F1220', fontSize: 11, fontWeight: '800' },
  distance: { color: colors.accent, fontSize: 12, marginTop: spacing.xs },
  location: { color: colors.text, fontWeight: '600', marginTop: spacing.sm },
  detail: { color: colors.text, fontSize: 13, marginTop: 3 },
  notes: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: spacing.sm },
  link: { color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
});
