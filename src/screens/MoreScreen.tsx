import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import AppointmentsScreen from './AppointmentsScreen';
import SettingsScreen from './SettingsScreen';

export default function MoreScreen({ route, user, guest, onLogout }: any) {
  const [page, setPage] = useState<'menu' | 'appointments' | 'settings'>('menu');

  useEffect(() => {
    if (route?.params?.open === 'appointments') setPage('appointments');
    if (route?.params?.open === 'settings') setPage('settings');
  }, [route?.params?.request]);

  if (page === 'appointments') {
    return <View style={styles.screen}><TouchableOpacity style={styles.back} onPress={() => setPage('menu')}><Text style={styles.backText}>‹ More</Text></TouchableOpacity><AppointmentsScreen /></View>;
  }

  if (page === 'settings') {
    return <View style={styles.screen}><TouchableOpacity style={styles.back} onPress={() => setPage('menu')}><Text style={styles.backText}>‹ More</Text></TouchableOpacity><SettingsScreen user={user} guest={guest} onLogout={onLogout} /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Your appointments and app settings.</Text>

      <TouchableOpacity style={styles.card} onPress={() => setPage('appointments')}>
        <View>
          <Text style={styles.cardTitle}>Appointments</Text>
          <Text style={styles.cardText}>Track appointments and reminders</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => setPage('settings')}>
        <View>
          <Text style={styles.cardTitle}>Settings</Text>
          <Text style={styles.cardText}>Account, device lock and logout</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  back: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { minHeight: 82, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  cardText: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  arrow: { color: colors.primary, fontSize: 34, marginLeft: spacing.md },
});
