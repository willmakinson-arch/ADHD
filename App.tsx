import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import ClinicsScreen from './src/screens/ClinicsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import RTCWizardScreen from './src/screens/RTCWizardScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import { colors } from './src/theme/theme';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onFinished={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'My Journey', tabBarLabel: 'Journey' }}
          />
          <Tab.Screen
            name="Clinics"
            component={ClinicsScreen}
            options={{ title: 'Assessment Providers', tabBarLabel: 'Providers' }}
          />
          <Tab.Screen
            name="Progress"
            component={ProgressScreen}
            options={{ title: 'Referral Progress', tabBarLabel: 'Progress' }}
          />
          <Tab.Screen
            name="RTC Wizard"
            component={RTCWizardScreen}
            options={{ title: 'Right to Choose', tabBarLabel: 'RTC' }}
          />
          <Tab.Screen
            name="Appointments"
            component={AppointmentsScreen}
            options={{ title: 'Appointments', tabBarLabel: 'Appts' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
