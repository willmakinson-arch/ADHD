import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

function currentBundleName() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  const script = Array.from(document.scripts).find(item => item.src.includes('/_expo/static/js/web/index-'));
  return script?.src.split('/').pop() ?? null;
}

export default function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const check = async () => {
      try {
        const response = await fetch(`/?update-check=${Date.now()}`, { cache: 'no-store' });
        const html = await response.text();
        const newest = html.match(/\/_expo\/static\/js\/web\/(index-[^"']+\.js)/)?.[1];
        const current = currentBundleName();
        if (newest && current && newest !== current) setUpdateAvailable(true);
      } catch {
        // Stay quiet when offline; the next focus or timer will retry.
      }
    };

    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    check();
    const timer = window.setInterval(check, 60000);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!updateAvailable) return null;

  const install = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.replace(`/?updated=${Date.now()}`);
    }
  };

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <View style={styles.copy}>
        <Text style={styles.title}>A new update is ready</Text>
        <Text style={styles.text}>Get the latest improvements without reinstalling the app.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={install} accessibilityRole="button">
        <Text style={styles.buttonText}>Update now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: 92, zIndex: 100, elevation: 10, backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  copy: { flex: 1 },
  title: { color: colors.text, fontSize: 14, fontWeight: '800' },
  text: { color: colors.textMuted, fontSize: 11, lineHeight: 15, marginTop: 2 },
  button: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 10 },
  buttonText: { color: '#0F1220', fontSize: 12, fontWeight: '900' },
});
