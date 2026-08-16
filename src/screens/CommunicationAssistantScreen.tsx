import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

type TemplateId = 'gp_followup' | 'employer_adjustments' | 'provider_questions' | 'access_to_work';
type Tone = 'plain' | 'formal';

const DRAFT_KEY = 'different-minds:communication:draft:v1';

const TEMPLATES: {
  id: TemplateId;
  title: string;
  text: string;
  subject: string;
  contextLabel: string;
  requestLabel: string;
}[] = [
  {
    id: 'gp_followup',
    title: 'GP / referral follow-up',
    text: 'Ask for an update, confirmation or next step without having to write the message from scratch.',
    subject: 'ADHD referral / assessment follow-up',
    contextLabel: 'What has happened so far?',
    requestLabel: 'What would you like them to confirm or do next?',
  },
  {
    id: 'employer_adjustments',
    title: 'Workplace adjustment request',
    text: 'Describe the work barrier and ask to discuss a practical change, without oversharing more health information than you want to.',
    subject: 'Request to discuss workplace adjustments',
    contextLabel: 'What work task, process or environment is creating a barrier?',
    requestLabel: 'What change or support would you like to discuss?',
  },
  {
    id: 'provider_questions',
    title: 'Ask a provider before choosing',
    text: 'Check the real pathway: availability, total cost, titration, prescribing, follow-up and shared-care assumptions.',
    subject: 'Questions before choosing an ADHD assessment pathway',
    contextLabel: 'What do you already know about the provider or pathway?',
    requestLabel: 'What do you specifically need them to confirm?',
  },
  {
    id: 'access_to_work',
    title: 'Access to Work conversation',
    text: 'Prepare a message about the practical barriers at work and the support you are exploring.',
    subject: 'Work support / Access to Work discussion',
    contextLabel: 'What practical barriers are affecting you at work?',
    requestLabel: 'What support or conversation would help you move forward?',
  },
];

function clean(value: string) {
  return value.trim();
}

function buildDraft(template: TemplateId, tone: Tone, recipient: string, context: string, request: string, signoff: string) {
  const hello = clean(recipient) ? `Hi ${clean(recipient)},` : 'Hello,';
  const close = clean(signoff) ? `\n\nKind regards,\n${clean(signoff)}` : '\n\nKind regards,';
  const contextText = clean(context);
  const requestText = clean(request);
  const softer = tone === 'plain';

  if (template === 'gp_followup') {
    return `${hello}\n\nI am following up about my ADHD referral / assessment pathway.${contextText ? `\n\nFor context: ${contextText}` : ''}\n\n${requestText || 'Could you please confirm the current position and let me know what the next step is from here?'}\n\nThank you for your help.${close}`;
  }

  if (template === 'employer_adjustments') {
    return `${hello}\n\n${softer ? 'I wanted to ask if we could have a conversation about some adjustments at work.' : 'I am writing to request a discussion about workplace adjustments.'}${contextText ? `\n\nThe main barrier I am experiencing is: ${contextText}` : ''}\n\n${requestText || 'I would like to discuss what practical changes could reduce that barrier and help me work effectively.'}\n\nI am happy to discuss what is workable for both me and the organisation, and I would prefer to agree the details together rather than make assumptions in this message.${close}`;
  }

  if (template === 'provider_questions') {
    return `${hello}\n\nI am considering your ADHD assessment pathway and would like to confirm a few details before making a decision.${contextText ? `\n\nWhat I currently understand is: ${contextText}` : ''}\n\n${requestText || 'Could you please confirm your current waiting time, the total assessment cost, what is included, any separate titration or prescribing costs, follow-up arrangements, and how shared care is handled where relevant?'}\n\nI understand that availability, prices and pathways can change, so I would be grateful for the current information.${close}`;
  }

  return `${hello}\n\n${softer ? 'I wanted to talk about some practical barriers I am experiencing at work and the support I am exploring.' : 'I am writing to discuss practical workplace barriers and possible support, including Access to Work where appropriate.'}${contextText ? `\n\nThe main barriers are: ${contextText}` : ''}\n\n${requestText || 'Could we arrange a conversation about what support may be helpful and what information would be needed from the workplace?'}\n\nI am checking the official eligibility and application guidance separately, so this message is just to start the workplace conversation.${close}`;
}

export default function CommunicationAssistantScreen() {
  const [template, setTemplate] = useState<TemplateId>('gp_followup');
  const [tone, setTone] = useState<Tone>('plain');
  const [recipient, setRecipient] = useState('');
  const [context, setContext] = useState('');
  const [request, setRequest] = useState('');
  const [signoff, setSignoff] = useState('');
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const selected = useMemo(() => TEMPLATES.find(item => item.id === template) ?? TEMPLATES[0], [template]);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<{
          template: TemplateId; tone: Tone; recipient: string; context: string; request: string; signoff: string; subject: string; draft: string;
        }>;
        if (saved.template && TEMPLATES.some(item => item.id === saved.template)) setTemplate(saved.template);
        if (saved.tone === 'plain' || saved.tone === 'formal') setTone(saved.tone);
        if (typeof saved.recipient === 'string') setRecipient(saved.recipient);
        if (typeof saved.context === 'string') setContext(saved.context);
        if (typeof saved.request === 'string') setRequest(saved.request);
        if (typeof saved.signoff === 'string') setSignoff(saved.signoff);
        if (typeof saved.subject === 'string') setSubject(saved.subject);
        if (typeof saved.draft === 'string') setDraft(saved.draft);
      } catch {
        // Local draft recovery is optional; the screen remains usable without it.
      }
    };
    load();
  }, []);

  const chooseTemplate = (value: TemplateId) => {
    const next = TEMPLATES.find(item => item.id === value) ?? TEMPLATES[0];
    setTemplate(value);
    setSubject(next.subject);
    setDraft('');
    setStatus(null);
  };

  const generate = async () => {
    const nextDraft = buildDraft(template, tone, recipient, context, request, signoff);
    setDraft(nextDraft);
    setStatus('Draft created. Read and edit it before opening your email app.');
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ template, tone, recipient, context, request, signoff, subject, draft: nextDraft }));
    } catch {}
  };

  const saveEditedDraft = async (value: string) => {
    setDraft(value);
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ template, tone, recipient, context, request, signoff, subject, draft: value }));
    } catch {}
  };

  const openEmail = async () => {
    if (!clean(draft)) {
      setStatus('Create and review a draft first.');
      return;
    }
    const mailto = `mailto:?subject=${encodeURIComponent(clean(subject))}&body=${encodeURIComponent(draft)}`;
    try {
      await Linking.openURL(mailto);
      setStatus('Your email app was opened with the draft. Different Minds has not sent anything.');
    } catch {
      setStatus('Could not open an email app on this device. You can still select the draft text and copy it manually.');
    }
  };

  const clearAll = async () => {
    setRecipient('');
    setContext('');
    setRequest('');
    setSignoff('');
    setSubject(selected.subject);
    setDraft('');
    setStatus(null);
    try { await AsyncStorage.removeItem(DRAFT_KEY); } catch {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.kicker}>COMMUNICATION ASSISTANT</Text>
        <Text style={styles.title}>Turn “I know what I need to say” into a message you can actually send.</Text>
        <Text style={styles.subtitle}>Choose the conversation, add only the facts you want included, then edit the result. Different Minds drafts; you stay in control of what leaves the device.</Text>
      </View>

      <Text style={styles.stepLabel}>1 · WHAT ARE YOU TRYING TO DO?</Text>
      <View style={styles.templateGrid}>
        {TEMPLATES.map(item => (
          <TouchableOpacity key={item.id} style={[styles.templateCard, template === item.id && styles.templateCardActive]} onPress={() => chooseTemplate(item.id)}>
            <View style={[styles.radio, template === item.id && styles.radioActive]}>{template === item.id && <View style={styles.radioInner} />}</View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.templateTitle, template === item.id && styles.templateTitleActive]}>{item.title}</Text>
              <Text style={styles.templateText}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.stepLabel}>2 · GIVE IT THE FACTS YOU WANT INCLUDED</Text>
        <Text style={styles.label}>Tone</Text>
        <View style={styles.toneRow}>
          <TouchableOpacity style={[styles.toneChip, tone === 'plain' && styles.toneChipActive]} onPress={() => setTone('plain')}><Text style={[styles.toneText, tone === 'plain' && styles.toneTextActive]}>Plain & natural</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.toneChip, tone === 'formal' && styles.toneChipActive]} onPress={() => setTone('formal')}><Text style={[styles.toneText, tone === 'formal' && styles.toneTextActive]}>More formal</Text></TouchableOpacity>
        </View>

        <Text style={styles.label}>Recipient name or role <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput style={styles.input} value={recipient} onChangeText={setRecipient} placeholder="e.g. Dr Patel, Practice Team, My Manager" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>{selected.contextLabel}</Text>
        <TextInput style={[styles.input, styles.multiline]} value={context} onChangeText={setContext} multiline textAlignVertical="top" placeholder="Write short factual notes in your own words" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>{selected.requestLabel}</Text>
        <TextInput style={[styles.input, styles.multiline]} value={request} onChangeText={setRequest} multiline textAlignVertical="top" placeholder="What outcome, answer or conversation do you want?" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Your name for the sign-off <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput style={styles.input} value={signoff} onChangeText={setSignoff} placeholder="Your name" placeholderTextColor={colors.textMuted} />

        <TouchableOpacity style={styles.generateButton} onPress={generate}><Text style={styles.generateText}>Create my draft</Text></TouchableOpacity>
      </View>

      <View style={styles.draftCard}>
        <Text style={styles.stepLabel}>3 · REVIEW IT BEFORE ANYTHING LEAVES THE APP</Text>
        <Text style={styles.label}>Subject</Text>
        <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Email subject" placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Editable draft</Text>
        <TextInput
          style={[styles.input, styles.draftInput]}
          value={draft}
          onChangeText={saveEditedDraft}
          multiline
          textAlignVertical="top"
          placeholder="Your draft will appear here after you tap Create my draft."
          placeholderTextColor={colors.textMuted}
        />

        {status && <Text style={styles.status}>{status}</Text>}

        <TouchableOpacity style={[styles.emailButton, !clean(draft) && styles.disabled]} onPress={openEmail} disabled={!clean(draft)}>
          <Text style={styles.emailText}>Open reviewed draft in email app</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearAll}><Text style={styles.clearText}>Clear local draft</Text></TouchableOpacity>
      </View>

      <View style={styles.safetyCard}>
        <Text style={styles.safetyTitle}>Built around review, not automation</Text>
        <Text style={styles.safetyText}>Different Minds does not send emails, contact a GP or employer, submit a referral, make a benefit claim or accept a provider's terms for you. Drafts are a starting point and are kept locally on this device in this phase.</Text>
      </View>

      <Text style={styles.footer}>For workplace matters, individual circumstances matter. Use current official guidance or professional advice if you need to understand legal rights or obligations.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 4, width: '100%', maxWidth: 980, alignSelf: 'center' },
  hero: { backgroundColor: colors.surfaceAlt, borderRadius: 26, borderWidth: 1, borderColor: colors.accent, padding: spacing.lg, marginBottom: spacing.lg },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 25, lineHeight: 31, fontWeight: '900', marginTop: 7 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  stepLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginBottom: 10 },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  templateCard: { flexGrow: 1, flexBasis: 300, minHeight: 100, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, flexDirection: 'row', gap: 11 },
  templateCardActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.primary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioActive: { borderColor: colors.accent },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  templateTitle: { color: colors.textMuted, fontSize: 14, fontWeight: '900' },
  templateTitleActive: { color: colors.text },
  templateText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  formCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 12, fontWeight: '800', marginBottom: 6, marginTop: 10 },
  optional: { color: colors.textMuted, fontWeight: '600' },
  toneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  toneChip: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 13 },
  toneChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primary },
  toneText: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },
  toneTextActive: { color: colors.text },
  input: { width: '100%', minHeight: 46, backgroundColor: colors.bg, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: 10, fontSize: 12 },
  multiline: { minHeight: 92 },
  generateButton: { minHeight: 50, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  generateText: { color: '#0F1220', fontSize: 13, fontWeight: '900' },
  draftCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.accent, padding: spacing.lg, marginBottom: spacing.md },
  draftInput: { minHeight: 280, lineHeight: 19 },
  status: { color: colors.accent, fontSize: 10, lineHeight: 15, marginTop: 10 },
  emailButton: { minHeight: 50, backgroundColor: colors.accent, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, paddingHorizontal: 12 },
  disabled: { opacity: 0.45 },
  emailText: { color: '#0F1220', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  clearButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  clearText: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },
  safetyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  safetyTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  safetyText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 5 },
  footer: { color: colors.textMuted, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.sm },
});
