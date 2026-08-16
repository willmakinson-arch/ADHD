import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { colors, radius, spacing } from '../theme/theme';

interface Appointment {
  id: string;
  title: string;
  dateISO: string;
  notes: string;
  notificationId: string | null;
}

type ScreenMode = 'appointments' | 'prepare';

type PrepState = {
  checked: string[];
  questions: string;
};

const APPOINTMENT_STORAGE_KEY = 'adhd_navigator_appointments_v1';
const PREP_STORAGE_KEY = 'different-minds:assessment-prep:v1';

const PREP_ITEMS = [
  {
    id: 'details',
    title: 'Confirm the practical details',
    description: 'Date, time, location or video link, and how long the provider expects the appointment to take.',
  },
  {
    id: 'forms',
    title: 'Check what the provider actually asked you to complete',
    description: 'Use the provider’s own instructions rather than filling in extra forms because you think you should.',
  },
  {
    id: 'medication',
    title: 'Gather relevant medication and health information',
    description: 'Have an accurate list available if the provider has asked for medical or medication history.',
  },
  {
    id: 'examples',
    title: 'Think of genuine everyday examples',
    description: 'Work, study, home, relationships, organisation or other areas where difficulties affect you. Use your own words.',
  },
  {
    id: 'childhood',
    title: 'Gather childhood or school history if it is genuinely available',
    description: 'Do not panic if records do not exist. Follow the provider’s instructions about what is useful for your assessment.',
  },
  {
    id: 'informant',
    title: 'Check whether the provider wants information from someone who knows you well',
    description: 'Only arrange this if the assessment provider has asked for it or explained why it is relevant.',
  },
  {
    id: 'questions',
    title: 'Write down the questions you want answered',
    description: 'For example: what happens after the assessment, when a report is issued, and how follow-up works.',
  },
  {
    id: 'access',
    title: 'Plan any practical adjustments you need for the appointment',
    description: 'Think about accessibility, communication, breaks, technology or environment and contact the provider if needed.',
  },
] as const;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function parseLocalDate(input: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const value = new Date(year, month - 1, day);

  if (
    value.getFullYear() !== year ||
    value.getMonth() !== month - 1 ||
    value.getDate() !== day
  ) {
    return null;
  }

  return value;
}

export default function AppointmentsScreen() {
  const [mode, setMode] = useState<ScreenMode>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [prep, setPrep] = useState<PrepState>({ checked: [], questions: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [appointmentRaw, prepRaw] = await Promise.all([
          AsyncStorage.getItem(APPOINTMENT_STORAGE_KEY),
          AsyncStorage.getItem(PREP_STORAGE_KEY),
        ]);

        if (appointmentRaw) {
          setAppointments(JSON.parse(appointmentRaw));
        }
        if (prepRaw) {
          const parsed = JSON.parse(prepRaw) as PrepState;
          setPrep({
            checked: Array.isArray(parsed.checked) ? parsed.checked : [],
            questions: typeof parsed.questions === 'string' ? parsed.questions : '',
          });
        }
      } catch {
        // Keep safe defaults if local storage cannot be read.
      }
    };

    load();
  }, []);

  const prepProgress = useMemo(
    () => Math.round((prep.checked.length / PREP_ITEMS.length) * 100),
    [prep.checked]
  );

  const persistAppointments = async (list: Appointment[]) => {
    setAppointments(list);
    try {
      await AsyncStorage.setItem(APPOINTMENT_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // The UI can still retain the list for this session.
    }
  };

  const persistPrep = async (next: PrepState) => {
    setPrep(next);
    try {
      await AsyncStorage.setItem(PREP_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The preparation workspace can still work for this session.
    }
  };

  const addAppointment = async () => {
    setFormError(null);
    if (!title.trim()) {
      setFormError('Add a short appointment title first.');
      return;
    }

    const target = parseLocalDate(date);
    if (!target) {
      setFormError('Use a valid date in YYYY-MM-DD format, for example 2026-09-21.');
      return;
    }

    let notificationId: string | null = null;
    const reminderTime = new Date(target);
    reminderTime.setDate(reminderTime.getDate() - 1);
    reminderTime.setHours(9, 0, 0, 0);

    if (Platform.OS !== 'web' && reminderTime.getTime() > Date.now()) {
      try {
        const permission = await Notifications.requestPermissionsAsync();
        if (permission.status === 'granted') {
          notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Appointment tomorrow',
              body: title.trim(),
            },
            trigger: { type: 'date', date: reminderTime } as any,
          });
        }
      } catch {
        notificationId = null;
      }
    }

    const appointment: Appointment = {
      id: uuidv4(),
      title: title.trim(),
      dateISO: date.trim(),
      notes: notes.trim(),
      notificationId,
    };

    const updated = [...appointments, appointment].sort((a, b) =>
      a.dateISO.localeCompare(b.dateISO)
    );

    await persistAppointments(updated);
    setTitle('');
    setDate('');
    setNotes('');
  };

  const removeAppointment = async (id: string) => {
    const target = appointments.find((appointment) => appointment.id === id);
    if (target?.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(target.notificationId);
      } catch {
        // A missing/cancelled operating-system notification should not block removal.
      }
    }

    await persistAppointments(appointments.filter((appointment) => appointment.id !== id));
  };

  const togglePrepItem = async (id: string) => {
    const checked = prep.checked.includes(id)
      ? prep.checked.filter((item) => item !== id)
      : [...prep.checked, id];

    await persistPrep({ ...prep, checked });
  };

  const saveQuestions = async () => {
    await persistPrep(prep);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>STAY ORGANISED WITHOUT OVERLOADING YOUR HEAD</Text>
        <Text style={styles.title}>Appointments & assessment prep</Text>
        <Text style={styles.subtitle}>
          Keep dates and practical preparation together on your device. Different Minds organises the process; it does not coach you toward a diagnosis.
        </Text>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentButton, mode === 'appointments' && styles.segmentButtonActive]}
          onPress={() => setMode('appointments')}
        >
          <Text style={[styles.segmentText, mode === 'appointments' && styles.segmentTextActive]}>
            Appointments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, mode === 'prepare' && styles.segmentButtonActive]}
          onPress={() => setMode('prepare')}
        >
          <Text style={[styles.segmentText, mode === 'prepare' && styles.segmentTextActive]}>
            Assessment prep
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'appointments' && (
        <View>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionKicker}>ADD A DATE</Text>
            <Text style={styles.sectionTitle}>Do not rely on memory alone</Text>
            <Text style={styles.sectionHelp}>
              Appointments are stored locally. On supported mobile builds, Different Minds can request permission to schedule a reminder for 9am the day before.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Appointment title, e.g. GP appointment"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={colors.textMuted}
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes — location, link, reference or what to take"
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            {formError && <Text style={styles.error}>{formError}</Text>}

            <TouchableOpacity style={styles.primaryButton} onPress={addAppointment}>
              <Text style={styles.primaryButtonText}>Add appointment</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && (
              <Text style={styles.platformNote}>
                Browser version: the appointment is saved locally, but native push reminders are intended for the mobile app build.
              </Text>
            )}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionKicker}>YOUR DATES</Text>
                <Text style={styles.sectionTitle}>Upcoming appointments</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{appointments.length}</Text>
              </View>
            </View>

            {appointments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Nothing to remember yet</Text>
                <Text style={styles.emptyText}>Add your next GP, provider or follow-up appointment above.</Text>
              </View>
            ) : (
              appointments.map((appointment) => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateBlockText}>{appointment.dateISO}</Text>
                  </View>
                  <View style={styles.appointmentCopy}>
                    <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                    {!!appointment.notes && (
                      <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => removeAppointment(appointment.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      {mode === 'prepare' && (
        <View>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.sectionKicker}>PRACTICAL PREPARATION</Text>
                <Text style={styles.progressTitle}>Assessment prep checklist</Text>
              </View>
              <Text style={styles.progressPercent}>{prepProgress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${prepProgress}%` }]} />
            </View>
            <Text style={styles.progressHelp}>
              This list helps you organise what is genuinely available. It never tells you what symptoms to report or what answers to give.
            </Text>
          </View>

          <View style={styles.sectionCard}>
            {PREP_ITEMS.map((item, index) => {
              const checked = prep.checked.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.checkRow, checked && styles.checkRowComplete]}
                  onPress={() => togglePrepItem(item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                >
                  <View style={[styles.checkBox, checked && styles.checkBoxComplete]}>
                    <Text style={styles.checkMark}>{checked ? '✓' : index + 1}</Text>
                  </View>
                  <View style={styles.checkCopy}>
                    <Text style={[styles.checkTitle, checked && styles.checkTitleComplete]}>
                      {item.title}
                    </Text>
                    <Text style={styles.checkDescription}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionKicker}>MY QUESTIONS</Text>
            <Text style={styles.sectionTitle}>What do I want to ask?</Text>
            <Text style={styles.sectionHelp}>
              Use this as a memory aid for questions you genuinely want answered during or after the appointment.
            </Text>
            <TextInput
              style={[styles.input, styles.questionsInput]}
              placeholder="Example: When should I expect the report? What happens after the assessment?"
              placeholderTextColor={colors.textMuted}
              value={prep.questions}
              onChangeText={(questions) => setPrep({ ...prep, questions })}
              onBlur={saveQuestions}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={saveQuestions}>
              <Text style={styles.secondaryButtonText}>Save questions on this device</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.safetyCard}>
            <Text style={styles.safetyLabel}>IMPORTANT BOUNDARY</Text>
            <Text style={styles.safetyText}>
              An ADHD assessment should reflect your real history and current difficulties. Different Minds is deliberately designed not to provide scripts or coached answers for obtaining a diagnosis.
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.footerNote}>
        General organisation support only. Confirm appointment requirements, clinical information and assessment instructions directly with your healthcare provider.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
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
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  title: { color: colors.text, fontSize: 23, lineHeight: 28, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  segmentButton: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  segmentButtonActive: { backgroundColor: colors.surfaceAlt },
  segmentText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  segmentTextActive: { color: colors.accent, fontWeight: '900' },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionKicker: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 4 },
  sectionHelp: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 5, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  notesInput: { minHeight: 66 },
  questionsInput: { minHeight: 120 },
  error: { color: colors.danger, fontSize: 11, lineHeight: 16, marginBottom: spacing.sm },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.text, fontSize: 13, fontWeight: '900' },
  secondaryButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  platformNote: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 8 },
  countBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  countBadgeText: { color: colors.accent, fontWeight: '900' },
  emptyCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  appointmentCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 11,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBlockText: { color: colors.accent, fontSize: 9, fontWeight: '900' },
  appointmentCopy: { flex: 1 },
  appointmentTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  appointmentNotes: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  removeText: { color: colors.danger, fontSize: 9, fontWeight: '800' },
  progressCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 4 },
  progressPercent: { color: colors.accent, fontSize: 20, fontWeight: '900' },
  progressTrack: {
    height: 8,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: radius.pill },
  progressHelp: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 8 },
  checkRow: {
    flexDirection: 'row',
    gap: 11,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkRowComplete: { opacity: 0.72 },
  checkBox: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxComplete: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkMark: { color: colors.text, fontSize: 10, fontWeight: '900' },
  checkCopy: { flex: 1 },
  checkTitle: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  checkTitleComplete: { color: colors.accent },
  checkDescription: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  safetyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  safetyLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  safetyText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  footerNote: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});
