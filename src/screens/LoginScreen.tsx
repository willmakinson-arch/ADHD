import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import Logo from '../components/Logo';
import { auth } from '../firebase';
import { colors, radius, spacing } from '../theme/theme';

type Props = { onContinueAsGuest: () => void };

function friendlyError(error: unknown) {
  const code = (error as { code?: string })?.code ?? '';
  if (code.includes('invalid-credential')) return 'That email or password is not correct.';
  if (code.includes('email-already-in-use')) return 'An account already exists for that email. Try signing in.';
  if (code.includes('weak-password')) return 'Please choose a password with at least 6 characters.';
  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('popup-closed')) return 'The Google sign-in window was closed.';
  if (code.includes('operation-not-allowed')) return 'This sign-in method still needs enabling in Firebase.';
  return 'Sign-in did not work. Please try again.';
}

export default function LoginScreen({ onContinueAsGuest }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (createAccount) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    if (Platform.OS !== 'web') {
      setError('Google sign-in will be added to the installed mobile build. Use email or continue without an account for now.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Logo size={82} />
      <Text style={styles.title}>Welcome to Different Minds</Text>
      <Text style={styles.subtitle}>Find clearer, faster routes through ADHD assessment and support.</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.googleButton} onPress={googleSignIn} disabled={busy}>
          <Text style={styles.googleMark}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.or}>or use email</Text>
          <View style={styles.divider} />
        </View>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoComplete={createAccount ? 'new-password' : 'current-password'}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={emailSignIn} disabled={busy}>
          {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.primaryText}>{createAccount ? 'Create account' : 'Sign in'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setCreateAccount(!createAccount); setError(null); }}>
          <Text style={styles.switchText}>
            {createAccount ? 'Already registered? Sign in' : 'New here? Create an account'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.guestButton} onPress={onContinueAsGuest}>
        <Text style={styles.guestText}>Continue without an account</Text>
      </TouchableOpacity>
      <Text style={styles.privacy}>Your clinic searches stay on this device. Different Minds does not sell personal data.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: spacing.md, textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 390, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { width: '100%', maxWidth: 430, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  googleButton: { backgroundColor: '#FFFFFF', borderRadius: radius.sm, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  googleMark: { color: '#4285F4', fontSize: 20, fontWeight: '800' },
  googleText: { color: '#202124', fontWeight: '700', fontSize: 15 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontSize: 12 },
  input: { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.md, minHeight: 48, marginBottom: spacing.sm },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radius.sm, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  primaryText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  switchText: { color: colors.accent, textAlign: 'center', fontWeight: '600', marginTop: spacing.md },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
  guestButton: { padding: spacing.md },
  guestText: { color: colors.text, fontWeight: '600', textDecorationLine: 'underline' },
  privacy: { color: colors.textMuted, maxWidth: 390, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
