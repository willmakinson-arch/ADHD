import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Logo from '../components/Logo';
import { colors, spacing, radius } from '../theme/theme';
import { useLocation } from '../context/LocationContext';

export default function HomeScreen({ navigation }: any) {
  const { status } = useLocation();
  const locationReady = status === 'granted';

  const openMore = (open: string) => navigation.navigate('More', { open, request: Date.now() });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl * 3 }}>
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <View style={styles.logoCard}><Logo size={62} /></View>
          <View style={styles.brandCopy}>
            <Text style={styles.kicker}>ADHD SUPPORT & GUIDANCE</Text>
            <Text style={styles.appName}>Different Minds</Text>
            <Text style={styles.subGreeting}>A clearer route through assessment and care.</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: locationReady ? colors.success : colors.textMuted }]} />
          <Text style={styles.statusText}>{locationReady ? 'Location ready for nearby clinics' : 'Search clinics by town or postcode'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.routeCard} onPress={() => openMore('journey')}>
        <View style={styles.routeTopRow}>
          <View style={styles.routeBadge}><Text style={styles.routeBadgeText}>START HERE</Text></View>
          <Text style={styles.routeArrow}>→</Text>
        </View>
        <Text style={styles.routeTitle}>Find My Route</Text>
        <Text style={styles.routeText}>Tell Different Minds where you live and where you are in the ADHD journey. Get one clear next step instead of another list of links.</Text>
        <View style={styles.routeFooter}>
          <Text style={styles.routeFooterText}>NHS pathway · Right to Choose · Private · Waiting · Assessment · After diagnosis</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickCard} onPress={() => openMore('progress')}>
          <Text style={styles.quickIcon}>✓</Text>
          <Text style={styles.quickTitle}>My Progress</Text>
          <Text style={styles.quickText}>See where you are and what comes next.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => openMore('prep')}>
          <Text style={styles.quickIcon}>◎</Text>
          <Text style={styles.quickTitle}>Assessment Prep</Text>
          <Text style={styles.quickText}>Practical preparation without symptom coaching.</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Assessment routes & tools</Text>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RTC')}>
        <View style={styles.cardIcon}><Text style={styles.cardIconText}>R</Text></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>Right to Choose clinics</Text><Text style={styles.cardText}>Explore NHS-funded assessment routes for England</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Private')}>
        <View style={[styles.cardIcon, styles.privateIcon]}><Text style={styles.cardIconText}>P</Text></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>Private ADHD clinics</Text><Text style={styles.cardText}>Compare nearby private assessment options</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Letter')}>
        <View style={[styles.cardIcon, styles.letterIcon]}><Text style={styles.cardIconText}>✎</Text></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>Build your GP letter</Text><Text style={styles.cardText}>Create a Right to Choose request to review with your GP</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => openMore('appointments')}>
        <View style={[styles.cardIcon, styles.diaryIcon]}><Text style={styles.cardIconText}>●</Text></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>Your appointments</Text><Text style={styles.cardText}>Keep dates and reminders together</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.noticeText}>General information and organisation support only — not a diagnosis. Always confirm important healthcare information with your GP or provider.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  hero: { backgroundColor: colors.surface, borderRadius: 26, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.xs, marginBottom: spacing.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoCard: { width: 76, height: 76, borderRadius: 21, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  brandCopy: { flex: 1 },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  appName: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 3 },
  subGreeting: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 9, marginTop: spacing.md, alignSelf: 'flex-start' },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  statusText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  routeCard: { backgroundColor: colors.surfaceAlt, borderRadius: 24, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.accent },
  routeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeBadge: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  routeBadgeText: { color: '#0F1220', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  routeArrow: { color: colors.accent, fontSize: 26, fontWeight: '900' },
  routeTitle: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 10 },
  routeText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  routeFooter: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 10, marginTop: 13, borderLeftWidth: 3, borderLeftColor: colors.primary },
  routeFooterText: { color: colors.textMuted, fontSize: 9, lineHeight: 14, fontWeight: '700' },
  quickRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  quickCard: { flex: 1, minHeight: 128, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 13 },
  quickIcon: { color: colors.accent, fontSize: 20, fontWeight: '900' },
  quickTitle: { color: colors.text, fontSize: 14, fontWeight: '900', marginTop: 8 },
  quickText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: spacing.sm, marginLeft: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  privateIcon: { backgroundColor: colors.accent },
  letterIcon: { backgroundColor: '#F7B267' },
  diaryIcon: { backgroundColor: '#B59CFF' },
  cardIconText: { color: '#0F1220', fontSize: 17, fontWeight: '900' },
  cardCopy: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  cardText: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  arrow: { color: colors.primary, fontSize: 28, marginLeft: spacing.sm },
  noticeText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.sm },
});
