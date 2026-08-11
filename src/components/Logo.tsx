import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/theme';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 96 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={colors.surface} stroke={colors.border} strokeWidth="1" />
      {/* Two different paths that converge — representing different minds, one destination */}
      <Path
        d="M 22 30 Q 40 30 40 50 Q 40 70 30 78"
        stroke={colors.primary}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 78 30 Q 60 30 60 50 Q 60 70 70 78"
        stroke={colors.accent}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx="50" cy="50" r="7" fill={colors.text} />
    </Svg>
  );
}
