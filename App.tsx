import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import ClinicsScreen from './src/screens/ClinicsScreen';
import RTCWizardScreen from './src/screens/RTCWizardScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import PrivateClinicsScreen from './src/screens/PrivateClinicsScreen';
import LoginScreen from './src/screens/LoginScreen';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/firebase';
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
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState(false);

  useEffect(() => onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    setAuthReady(true);
  }), []);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onFinished={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  if (!authReady) {
    return <SafeAreaProvider><View style={{ flex: 1, backgroundColor: colors.bg }} /></SafeAreaProvider>;
  }

  if (!user && !guest) {
    return <SafeAreaProvider><StatusBar style="light" /><LoginScreen onContinueAsGuest={() => setGuest(true)} /></SafeAreaProvider>;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Clinics" component={ClinicsScreen} />
          <Tab.Screen name="Private Clinics" component={PrivateClinicsScreen} />
          <Tab.Screen name="RTC Wizard" component={RTCWizardScreen} />
          <Tab.Screen name="Appointments" component={AppointmentsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
