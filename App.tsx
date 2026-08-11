import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import ClinicsScreen from './src/screens/ClinicsScreen';
import RTCWizardScreen from './src/screens/RTCWizardScreen';
import PrivateClinicsScreen from './src/screens/PrivateClinicsScreen';
import LoginScreen from './src/screens/LoginScreen';
import DeviceUnlockScreen from './src/screens/DeviceUnlockScreen';
import MoreScreen from './src/screens/MoreScreen';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './src/firebase';
import { deviceLockEnabled } from './src/utils/deviceLock';
import { colors } from './src/theme/theme';
import { LocationProvider, useLocation } from './src/context/LocationContext';

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

function AppContent() {
  const insets = useSafeAreaInsets();
  const [showSplash, setShowSplash] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState(false);
  const [deviceUnlocked, setDeviceUnlocked] = useState(false);
  const { status: locationStatus, requestLocation } = useLocation();

  useEffect(() => onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    setAuthReady(true);
  }), []);

  useEffect(() => {
    if ((user || guest) && locationStatus === 'idle') requestLocation();
  }, [user, guest, locationStatus]);

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

  const logout = async () => {
    if (user) await signOut(auth);
    setGuest(false);
    setDeviceUnlocked(false);
  };

  if (user && deviceLockEnabled() && !deviceUnlocked) {
    return <SafeAreaProvider><StatusBar style="light" /><DeviceUnlockScreen onUnlocked={() => setDeviceUnlocked(true)} onSignOut={logout} /></SafeAreaProvider>;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              height: 66 + insets.bottom,
              paddingTop: 7,
              paddingBottom: Math.max(insets.bottom, 7),
            },
            tabBarItemStyle: { minWidth: 0, paddingHorizontal: 1 },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '800', marginTop: 2 },
            tabBarIconStyle: { marginBottom: 0 },
            tabBarHideOnKeyboard: true,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <TabIcon symbol="⌂" color={color} /> }} />
          <Tab.Screen name="RTC" component={ClinicsScreen} options={{ title: 'RTC Clinics', tabBarLabel: 'RTC', tabBarIcon: ({ color }) => <TabIcon symbol="R" color={color} /> }} />
          <Tab.Screen name="Private" component={PrivateClinicsScreen} options={{ title: 'Private Clinics', tabBarLabel: 'Private', tabBarIcon: ({ color }) => <TabIcon symbol="P" color={color} /> }} />
          <Tab.Screen name="Letter" component={RTCWizardScreen} options={{ title: 'RTC Letter', tabBarLabel: 'Letter', tabBarIcon: ({ color }) => <TabIcon symbol="✎" color={color} /> }} />
          <Tab.Screen name="More" options={{ tabBarIcon: ({ color }) => <TabIcon symbol="•••" color={color} /> }}>
            {props => <MoreScreen {...props} user={user} guest={guest} onLogout={logout} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function TabIcon({ symbol, color }: { symbol: string; color: string }) {
  return (
    <View style={{ width: 32, height: 27, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }}>
      <Text style={{ color, fontSize: symbol === 'DM' ? 11 : 17, fontWeight: '900' }}>{symbol}</Text>
    </View>
  );
}

export default function App() {
  return <SafeAreaProvider><LocationProvider><AppContent /></LocationProvider></SafeAreaProvider>;
}
