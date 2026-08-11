import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from '../components/Logo';
import { colors, radius, spacing } from '../theme/theme';
import { unlockWithDevice } from '../utils/deviceLock';

export default function DeviceUnlockScreen({ onUnlocked, onSignOut }: { onUnlocked: () => void; onSignOut: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unlock = async () => {
    setBusy(true); setError(null);
    try {
      if (await unlockWithDevice()) onUnlocked();
      else setError('Face ID or device verification did not complete.');
    } catch {
      setError('Device verification was cancelled or unavailable.');
    } finally { setBusy(false); }
  };
  return <View style={styles.container}>
    <Logo size={82} />
    <Text style={styles.title}>Different Minds is locked</Text>
    <Text style={styles.subtitle}>Use Face ID, Touch ID, Windows Hello, or your device passcode to continue.</Text>
    {error && <Text style={styles.error}>{error}</Text>}
    <TouchableOpacity style={styles.button} onPress={unlock} disabled={busy}>
      {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonText}>Unlock with device</Text>}
    </TouchableOpacity>
    <TouchableOpacity onPress={onSignOut}><Text style={styles.signOut}>Sign out instead</Text></TouchableOpacity>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: spacing.md },
  subtitle: { color: colors.textMuted, textAlign: 'center', lineHeight: 20, maxWidth: 390, marginVertical: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
  button: { width: '100%', maxWidth: 390, minHeight: 50, backgroundColor: colors.primary, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.text, fontWeight: '800' },
  signOut: { color: colors.textMuted, textDecorationLine: 'underline', marginTop: spacing.lg },
});
