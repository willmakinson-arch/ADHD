import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Logo from '../components/Logo';
import { colors, spacing, radius } from '../theme/theme';

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.header}>
        <View style={styles.logoCard}><Logo size={82} /></View>
        <Text style={styles.appName}>Different Minds</Text>
        <Text style={styles.subGreeting}>ADHD support &amp; guidance</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RTC')}>
        <Text style={styles.cardTitle}>Find an NHS Right to Choose clinic</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Private')}>
        <Text style={styles.cardTitle}>Find a private ADHD clinic</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Letter')}>
        <Text style={styles.cardTitle}>Build your GP letter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('More', { open: 'appointments', request: Date.now() })}>
        <Text style={styles.cardTitle}>Your appointments</Text>
      </TouchableOpacity>

      <Text style={styles.noticeText}>
        General information only — not a diagnosis. Always confirm with your GP or provider.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  logoCard: { width: 104, height: 104, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  appName: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: spacing.md },
  subGreeting: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  noticeText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
