import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { User } from 'firebase/auth';
import { colors, radius, spacing } from '../theme/theme';
import { deviceLockAvailable, deviceLockEnabled, disableDeviceLock, enableDeviceLock } from '../utils/deviceLock';

type Props = { user: User | null; guest: boolean; onLogout: () => Promise<void> };

export default function SettingsScreen({ user, guest, onLogout }: Props) {
  const [lockEnabled, setLockEnabled] = useState(Platform.OS === 'web' && deviceLockEnabled());
  const [message, setMessage] = useState<string | null>(null);

  const changeDeviceLock = async (enabled: boolean) => {
    setMessage(null);
    if (!user) { setMessage('Sign in with Gmail or email before enabling device lock.'); return; }
    if (!enabled) { disableDeviceLock(); setLockEnabled(false); setMessage('Device lock is off.'); return; }
    try {
      await enableDeviceLock(user.uid, user.email ?? 'Different Minds user');
      setLockEnabled(true);
      setMessage('Device lock is on. It will be requested after reopening the app.');
    } catch {
      setMessage('Face ID or device-lock setup was cancelled or is not supported here.');
    }
  };

  return <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Settings</Text>

    <View style={styles.card}>
      <Text style={styles.heading}>Account</Text>
      <Text style={styles.value}>{guest ? 'Using Different Minds as a guest' : user?.email ?? 'Signed in'}</Text>
      <Text style={styles.detail}>{guest ? 'Guest data stays on this device.' : 'Your Firebase login stays active securely on this device.'}</Text>
    </View>

    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.heading}>Face ID / device lock</Text>
          <Text style={styles.detail}>Protects the app with Face ID, Touch ID, Windows Hello, or your device passcode after you have signed in.</Text>
        </View>
        <Switch value={lockEnabled} onValueChange={changeDeviceLock} disabled={guest || !deviceLockAvailable()} trackColor={{ false: colors.border, true: colors.primaryDark }} />
      </View>
      {!deviceLockAvailable() && <Text style={styles.warning}>Device lock is unavailable in this browser. Add the site to your iPhone Home Screen and try there.</Text>}
      {message && <Text style={styles.message}>{message}</Text>}
    </View>

    <View style={styles.card}>
      <Text style={styles.heading}>Notifications</Text>
      <Text style={styles.detail}>Appointment reminders are stored on this device. Browser notification permission is requested only when needed.</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.heading}>Privacy and safety</Text>
      <Text style={styles.detail}>Clinic searches and appointments remain on this device. Different Minds provides guidance, not diagnosis or emergency care. Call 999 in an emergency.</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.heading}>About</Text>
      <Text style={styles.detail}>Different Minds · Version 1.0.0{`\n`}UK ADHD assessment navigation and support.</Text>
    </View>

    <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert('Sign out?', 'You will return to the login screen.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: onLogout }])}>
      <Text style={styles.logoutText}>{guest ? 'Leave guest mode' : 'Sign out'}</Text>
    </TouchableOpacity>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  heading: { color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: spacing.xs },
  value: { color: colors.accent, fontWeight: '600', marginBottom: spacing.xs },
  detail: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowText: { flex: 1 },
  warning: { color: colors.danger, fontSize: 12, marginTop: spacing.sm },
  message: { color: colors.accent, fontSize: 12, marginTop: spacing.sm },
  logoutButton: { borderColor: colors.danger, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', padding: spacing.md, marginTop: spacing.sm },
  logoutText: { color: colors.danger, fontWeight: '800' },
});
