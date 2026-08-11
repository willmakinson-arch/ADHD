import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native';
import { CLINICS } from '../data/clinics';
import { colors, spacing, radius } from '../theme/theme';

const STEPS = ['Your details', 'Choose a provider', 'Your letter'];

export default function RTCWizardScreen() {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gpSurgery, setGpSurgery] = useState('');
  const [providerId, setProviderId] = useState(CLINICS[0].id);

  const rtcProviders = CLINICS.filter((c) => c.rtcEligible);
  const provider = CLINICS.find((c) => c.id === providerId) ?? rtcProviders[0];

  const letter = `Dear Dr [GP's name],

Re: Request for Right to Choose referral — ${fullName || '[Your full name]'}, DOB ${
    dob || '[DOB]'
  }

I am writing under the NHS Right to Choose policy to request a referral for an ADHD assessment with ${
    provider?.name ?? '[Provider]'
  }, who hold an NHS Standard Contract for this service.

Under the NHS Constitution, I have the legal right to choose a clinically appropriate provider for my care, and I understand this practice cannot refuse a valid Right to Choose request without clinical justification.

Could you please complete and submit a referral to ${
    provider?.name ?? '[Provider]'
  } at your earliest convenience? I am registered at ${gpSurgery || '[GP surgery name]'}.

Please let me know if you need any further information from me to process this referral.

Thank you for your time.

Kind regards,
${fullName || '[Your full name]'}`;

  const shareLetter = async () => {
    try {
      await Share.share({ message: letter });
    } catch (e) {
      // no-op — sharing may not be available in this environment
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.title}>Right to Choose letter builder</Text>
      <Text style={styles.subtitle}>
        This generates a letter for you to hand or send to your GP. Nothing is submitted
        automatically — you stay in control of sending it.
      </Text>

      <View style={styles.stepper}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepDotWrap}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]} />
            <Text style={styles.stepLabel}>{s}</Text>
          </View>
        ))}
      </View>

      {step === 0 && (
        <View>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.label}>GP surgery name</Text>
          <TextInput
            style={styles.input}
            value={gpSurgery}
            onChangeText={setGpSurgery}
            placeholder="Your GP surgery"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={styles.label}>Choose an RTC-eligible provider</Text>
          {rtcProviders.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.providerOption,
                providerId === p.id && styles.providerOptionActive,
              ]}
              onPress={() => setProviderId(p.id)}
            >
              <Text style={styles.providerName}>{p.name}</Text>
              <Text style={styles.providerMeta}>
                Typical wait: {p.typicalWaitMonths} months
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 2 && (
        <View>
          <View style={styles.letterBox}>
            <Text style={styles.letterText}>{letter}</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={shareLetter}>
            <Text style={styles.primaryBtnText}>Share / send letter</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.navRow}>
        {step > 0 && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.secondaryBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(step + 1)}>
            <Text style={styles.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  stepDotWrap: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: 4, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerOption: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerOptionActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  providerName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  providerMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  letterBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  letterText: { color: colors.text, fontSize: 13, lineHeight: 20 },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.text, fontWeight: '700' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.text, fontWeight: '700' },
});
