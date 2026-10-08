import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

// Buyurtma holati banneri. Javob kutilayotganda (`pulsing`) belgi sekin miltillab turadi.
export default function StatusBanner({ info, pulsing }) {
  const { theme: t } = useTheme();
  const color = t[info.tone] ?? t.orange;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulsing) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, pulse]);

  return (
    <View style={[s.banner, { backgroundColor: color + '18', borderColor: color + '44' }]}>
      <Animated.View style={[s.icon, { backgroundColor: color + '26', opacity: pulse }]}>
        <MaterialCommunityIcons name={info.icon} size={24} color={color} />
      </Animated.View>
      <View style={{ flex: 1 }}>
        <Text style={[s.title, { color: t.text }]}>{info.title}</Text>
        {!!info.sub && <Text style={[s.sub, { color: t.muted }]}>{info.sub}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 15.5 },
  sub: { fontSize: 12.5, lineHeight: 18, marginTop: 4 },
});
