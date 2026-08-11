import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { colors, spacing, radius } from '../theme/theme';

interface Appointment {
  id: string;
  title: string;
  dateISO: string; // YYYY-MM-DD
  notes: string;
  notificationId: string | null;
}

const STORAGE_KEY = 'adhd_navigator_appointments_v1';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [notes, setNotes] = useState('');

  useEffect(() => {
    load();
    Notifications.requestPermissionsAsync().catch(() => {});
  }, []);

  const load = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setAppointments(JSON.parse(raw));
  };

  const persist = async (list: Appointment[]) => {
    setAppointments(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addAppointment = async () => {
    if (!title.trim() || !date.trim()) return;
    const target = new Date(date);
    if (isNaN(target.getTime())) return;

    let notificationId: string | null = null;
    // Schedule a reminder for 9am the day before, if the date is in the future.
    const reminderTime = new Date(target);
    reminderTime.setDate(reminderTime.getDate() - 1);
    reminderTime.setHours(9, 0, 0, 0);

    if (reminderTime.getTime() > Date.now()) {
      try {
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Appointment tomorrow',
            body: title,
          },
          trigger: { type: 'date', date: reminderTime } as any,
        });
      } catch (e) {
        notificationId = null;
      }
    }

    const appt: Appointment = {
      id: uuidv4(),
      title: title.trim(),
      dateISO: date.trim(),
      notes: notes.trim(),
      notificationId,
    };

    const updated = [...appointments, appt].sort((a, b) =>
      a.dateISO.localeCompare(b.dateISO)
    );
    await persist(updated);
    setTitle('');
    setDate('');
    setNotes('');
  };

  const removeAppointment = async (id: string) => {
    const target = appointments.find((a) => a.id === id);
    if (target?.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(target.notificationId);
      } catch (e) {
        // ignore
      }
    }
    await persist(appointments.filter((a) => a.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your appointments</Text>
      <Text style={styles.subtitle}>
        Stored only on this device. You'll get a reminder the day before, at 9am.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Appointment title (e.g. GP appointment)"
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
      />
      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        placeholderTextColor={colors.textMuted}
        value={notes}
        onChangeText={setNotes}
      />
      <TouchableOpacity style={styles.addBtn} onPress={addAppointment}>
        <Text style={styles.addBtnText}>Add appointment</Text>
      </TouchableOpacity>

      <FlatList
        style={{ marginTop: spacing.md }}
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.apptTitle}>{item.title}</Text>
              <Text style={styles.apptDate}>{item.dateISO}</Text>
              {!!item.notes && <Text style={styles.apptNotes}>{item.notes}</Text>}
            </View>
            <TouchableOpacity onPress={() => removeAppointment(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No appointments yet — add one above.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: { color: colors.text, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  apptTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  apptDate: { color: colors.accent, fontSize: 12, marginTop: 2 },
  apptNotes: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  remove: { color: colors.danger, fontWeight: '600' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
