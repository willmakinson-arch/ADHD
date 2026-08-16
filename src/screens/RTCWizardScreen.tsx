import React, { useMemo, useState } from 'react';
import {
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CLINICS } from '../data/clinics';
import { colors, radius, spacing } from '../theme/theme';

const STEPS = ['Your details', 'Choose a provider', 'Review request'];
const NHS_CHOICE_URL =
  'https://www.nhs.uk/mental-health/social-care-and-your-rights/how-to-access-mental-health-services/';

export default function RTCWizardScreen() {
  const rtcProviders = useMemo(() => CLINICS.filter((c) => c.rtcEligible), []);
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gpSurgery, setGpSurgery] = useState('');
  const [providerId, setProviderId] = useState(rtcProviders[0]?.id ?? '');

  const provider = rtcProviders.find((c) => c.id === providerId) ?? rtcProviders[0];

  const letter = `Dear Dr [GP's name],

Re: Request to discuss NHS patient choice for an ADHD assessment — ${
    fullName || '[Your full name]'
  }, DOB ${dob || '[DOB]'}

I am writing to ask whether I can use my NHS patient choice rights for a first outpatient ADHD assessment with ${
    provider?.name ?? '[Provider]'
  }.

I understand that patient choice depends on my individual circumstances, clinical appropriateness and the provider meeting the relevant NHS requirements for the service at the time of referral.

If this choice is available and clinically appropriate for me, could you please make the referral to ${
    provider?.name ?? '[Provider]'
  }? I am registered at ${gpSurgery || '[GP surgery name]'}.

Please let me know if you need any further information, forms or screening documents from me, or if there is a clinical or eligibility reason why this route is not available in my circumstances.

Thank you for your time.

Kind regards,
${fullName || '[Your full name]'}`;

  const shareLetter = async () => {
    try {
      await Share.share({ message: letter });
    } catch {
      // Sharing may not be available in every web/native environment.
    }
  };

  const openNhsGuidance = () => {
    Linking.openURL(NHS_CHOICE_URL).catch(() => undefined);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>ENGLAND PATHWAY</Text>
        <Text style={styles.title}>Right to Choose request builder</Text>
        <Text style={styles.subtitle}>
          Prepare a request to discuss with your GP. Different Minds does not decide eligibility and does not submit anything automatically.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Before you use this tool</Text>
        <Text style={styles.infoText}>
          The NHS patient-choice framework used here applies to England. Choice rights have conditions and exceptions, and the provider must be clinically appropriate and meet the relevant NHS requirements for the service.
        </Text>
        <TouchableOpacity onPress={openNhsGuidance}>
          <Text style={styles.infoLink}>Read current NHS guidance →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stepper}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepDotWrap}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]} />
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      {step === 0 && (
        <View style={styles.formCard}>
          <Text style={styles.formHeading}>Your details</Text>
          <Text style={styles.formHelp}>
            These details stay in this form while you prepare the letter. Review everything before sharing it.
          </Text>
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
        <View style={styles.formCard}>
          <Text style={styles.formHeading}>Choose a listed RTC provider</Text>
          <Text style={styles.formHelp}>
            Provider status and waiting information can change. Verify the provider's current NHS pathway directly before sending your request.
          </Text>
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
              <Text style={styles.providerMeta}>{p.regionsCovered}</Text>
              <Text style={styles.providerMeta}>
                Listed wait: {p.typicalWaitMonths} months — verify current status
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 2 && (
        <View>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewHeading}>Review every line before sending</Text>
            <Text style={styles.reviewHelp}>
              This wording deliberately asks your GP to confirm availability and appropriateness instead of presenting eligibility as automatic.
            </Text>
            <View style={styles.letterBox}>
              <Text style={styles.letterText}>{letter}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={shareLetter}>
            <Text style={styles.primaryBtnText}>Share / send reviewed request</Text>
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

      <Text style={styles.footerNote}>
        General navigation support only. If you need urgent or crisis care, use the appropriate urgent NHS or emergency service rather than this pathway tool.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  heroCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  title: { color: colors.text, fontSize: 23, lineHeight: 28, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  infoTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  infoText: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  infoLink: { color: colors.accent, fontWeight: '800', fontSize: 12, marginTop: 9 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  stepDotWrap: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  stepDotActive: { backgroundColor: colors.accent },
  stepLabel: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },
  stepLabelActive: { color: colors.text, fontWeight: '800' },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formHeading: { color: colors.text, fontSize: 17, fontWeight: '800' },
  formHelp: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 5, marginBottom: 5 },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 4, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerOption: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerOptionActive: { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
  providerName: { color: colors.text, fontWeight: '800', fontSize: 15 },
  providerMeta: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  reviewHeading: { color: colors.text, fontSize: 16, fontWeight: '800' },
  reviewHelp: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  letterBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  letterText: { color: colors.text, fontSize: 12, lineHeight: 19 },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.text, fontWeight: '800', textAlign: 'center' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.text, fontWeight: '800' },
  footerNote: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
});
