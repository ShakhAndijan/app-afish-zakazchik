import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';

const W = 76;
const H = 38;
const PAD = 4;
const THUMB = H - PAD * 2;
const TRAVEL = W - PAD * 2 - THUMB;

// Yorug'/qorong'i rejim almashtirgichi: ☀ | 🌙 segmentli kapsula, tanlangan rejim ostida
// siljiydigan "tugma" (thumb) turadi.
export default function ThemeSwitch({ style }) {
  const { theme: t, toggleTheme } = useTheme();
  const isDark = t.isDark !== false;
  const [anim] = useState(() => new Animated.Value(isDark ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isDark ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isDark, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] });

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel="Dark mode"
      hitSlop={6}
      style={[
        s.track,
        {
          backgroundColor: isDark ? '#0a1626' : '#e6ebf2',
          borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          s.thumb,
          {
            backgroundColor: isDark ? '#20364c' : '#ffffff',
            shadowColor: '#000',
            transform: [{ translateX }],
          },
        ]}
      />
      <View style={s.icon} pointerEvents="none">
        <Feather name="sun" size={16} color={isDark ? t.faint : t.orange} />
      </View>
      <View style={s.icon} pointerEvents="none">
        <Feather name="moon" size={16} color={isDark ? t.gold : '#8a97ab'} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  track: {
    width: W,
    height: H,
    borderRadius: H / 2,
    borderWidth: 1,
    padding: PAD - 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    position: 'absolute',
    left: PAD - 1,
    top: PAD - 1,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: THUMB,
    height: THUMB,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
    flex: 1,
  },
});
