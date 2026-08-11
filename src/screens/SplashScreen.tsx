import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Logo from '../components/Logo';
import { colors, spacing } from '../theme/theme';

interface SplashScreenProps {
  onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinished();
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
        <Logo size={110} />
        <Text style={styles.title}>Different Minds</Text>
        <Text style={styles.tagline}>ADHD support & guidance</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
