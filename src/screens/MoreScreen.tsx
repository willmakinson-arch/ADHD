import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import AppointmentsScreen from './AppointmentsScreen';
import AssessmentPrepScreen from './AssessmentPrepScreen';
import JourneyScreen from './JourneyScreen';
import ProgressScreen from './ProgressScreen';
import SettingsScreen from './SettingsScreen';

type Page = 'menu' | 'journey' | 'progress' | 'prep' | 'appointments' | 'settings';

export default function MoreScreen({ route, navigation, user, guest, onLogout }: any) {
  const [page, setPage] = useState<Page>('menu');

  useEffect(() => {
    const target = route?.params?.open as Page | undefined;
    if (target && ['journey', 'progress', 'prep', 'appointments', 'settings'].includes(target)) setPage(target);
  }, [route?.params?.request, route?.params?.open]);

  const subPage = (title: string, child: React.ReactNode) => (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => setPage('menu')}>
        <Text style={styles.backText}>‹ More</Text>
        <Text style={styles.backTitle}>{title}</Text>
      </TouchableOpacity>
      {child}
    </View>
  );

  if (page === 'journey') return subPage('Find My Route', <JourneyScreen navigation={navigation} />);
  if (page === 'progress') return subPage('My Progress', <ProgressScreen navigation={navigation} />);
  if (page === 'prep') return subPage('Assessment Prep', <AssessmentPrepScreen />);
  if (page === 'appointments') return subPage('Appointments', <AppointmentsScreen />);
  if (page === 'settings') return subPage('Settings', <SettingsScreen user={user} guest={guest} onLogout={onLogout} />);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>DIFFERENT MINDS</Text>
        <Text style={styles.title}>Your ADHD journey, organised around what comes next.</Text>
        <Text style={styles.subtitle}>Use the journey tools to find your route, remember where your referral is up to and prepare for appointments without having to hold the whole process in your head.</Text>
      </View>

      <Text style={styles.sectionTitle}>Journey tools</Text>
      <MenuCard symbol="→" title="Find My Route" text="Tell us where you live and where you are in the ADHD journey. Get one clear next step." highlight onPress={() => setPage('journey')} />
      <MenuCard symbol="✓" title="My Progress" text="Track referral and assessment milestones on this device." onPress={() => setPage('progress')} />
      <MenuCard symbol="◎" title="Assessment Prep" text="A practical checklist and question memory-aid without symptom coaching." onPress={() => setPage('prep')} />
      <MenuCard symbol="●" title="Appointments" text="Keep appointment dates and reminders together." onPress={() => setPage('appointments')} />

      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>App</Text>
      <MenuCard symbol="⚙" title="Settings" text="Account, device lock and logout." onPress={() => setPage('settings')} />

      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Designed to reduce executive-function load</Text>
        <Text style={styles.privacyText}>Journey stage, progress and preparation notes are kept locally on the device in this phase. Different Minds does not treat self-selected progress as a clinical record.</Text>
      </View>
    </ScrollView>
  );
}

function MenuCard({ symbol, title, text, onPress, highlight = false }: { symbol: string; title: string; text: string; onPress: () => void; highlight?: boolean }) {
  return (
    <TouchableOpacity style={[styles.card, highlight && styles.cardHighlight]} onPress={onPress}>
      <View style={[styles.icon, highlight && styles.iconHighlight]}><Text style={styles.iconText}>{symbol}</Text></View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{text}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  back: { minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '900', marginRight: spacing.sm },
  backTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 3 },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 24, borderWidth: 1, borderColor: colors.primary, padding: spacing.lg, marginBottom: spacing.lg },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 6 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: spacing.sm, marginLeft: 2 },
  card: { minHeight: 88, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  cardHighlight: { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
  icon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  iconHighlight: { backgroundColor: colors.accent },
  iconText: { color: '#0F1220', fontSize: 18, fontWeight: '900' },
  cardCopy: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  cardText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  arrow: { color: colors.primary, fontSize: 30, marginLeft: spacing.sm },
  privacyCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 13, marginTop: spacing.md },
  privacyTitle: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  privacyText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 4 },
});
